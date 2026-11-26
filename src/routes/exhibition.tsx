import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, Undo2, ChevronRight, Pause, Play, Layers, Box } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { ArtworkViewer } from "@/components/artwork-viewer";
import { InquiryDialog } from "@/components/inquiry-dialog";
import { CheckoutDialog } from "@/components/checkout-dialog";
import { CollectionFilters } from "@/components/collection-filters";
import { useShop } from "@/hooks/use-shop";
import { useProjects } from "@/hooks/use-projects";
import { useArtworks } from "@/hooks/use-artworks";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Lang } from "@/lib/artworks";
import { genres, styles, resolveTerms, filterByTaxonomy } from "@/lib/genres";
import { isProjectWork, searchWorks } from "@/lib/directions";
import { exhibitionPage, exhibitionPageCount } from "@/lib/exhibition-pages";
import { EXHIBITION_LIMIT } from "@/lib/exhibition-layout";
import type { GalleryAction } from "@/components/virtual-gallery";

const VirtualGallery = lazy(() => import("@/components/virtual-gallery").then((m) => ({ default: m.VirtualGallery })));
export const EXHIBITION_KEY = "prosetskaya-exhibition";
export const EXHIBITION_MAX = EXHIBITION_LIMIT;
export const Route = createFileRoute("/exhibition")({ ssr: false, head: () => ({ meta: [
  { title: "Виртуальная выставка — Юлия Просецкая" },
  { name: "description", content: "Живопись Юлии Просецкой в виртуальных выставочных залах. Выберите жанр или направление и осмотрите всю экспозицию." },
  { property: "og:title", content: "Виртуальная выставка Юлии Просецкой" },
  { property: "og:description", content: "Выбор жанров и направлений, прогулка по залу и смена экспозиции." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
] }), component: Exhibition });

function Exhibition() {
  const all = useArtworks(); const projects = useProjects(); const shop = useShop().data;
  const [lang, setLang] = useState<Lang>("ru"); const ru = lang === "ru";
  const [ids, setIds] = useState<string[] | null>(null);
  const [selectionName, setSelectionName] = useState<string[]>([]);
  const [choosing, setChoosing] = useState(false);
  const [genre, setGenre] = useState<string[]>([]); const [style, setStyle] = useState<string[]>([]); const [query, setQuery] = useState("");
  const [page, setPage] = useState(0); const [index, setIndex] = useState(-1); const [auto, setAuto] = useState(false);
  const [distance, setDistance] = useState(1); const [resetKey, setResetKey] = useState(0);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [viewerAction, setViewerAction] = useState<GalleryAction | undefined>(undefined);
  const [dialog, setDialog] = useState<{ action: "inquiry" | "checkout"; i: number } | null>(null);
  const paused = viewerIndex !== null || dialog !== null || choosing;
  const main = all.filter((w) => !isProjectWork(w));
  const genreTerms = (shop?.genres ?? resolveTerms([], genres)).filter((t) => !t.hidden && main.some((w) => w.genre === t.key));
  const styleTerms = (shop?.styles ?? resolveTerms([], styles)).filter((t) => !t.hidden && main.some((w) => w.style === t.key));
  const selected = searchWorks(filterByTaxonomy(main, genre, style), query);
  useEffect(() => {
    setLang(localStorage.getItem("prosetskaya-lang") === "en" ? "en" : "ru");
    try {
      const stored: unknown = JSON.parse(sessionStorage.getItem(EXHIBITION_KEY) ?? "[]");
      const list = Array.isArray(stored) ? stored.filter((id): id is string => typeof id === "string") : [];
      setIds(list); setChoosing(!list.length);
      const names: unknown = JSON.parse(sessionStorage.getItem("prosetskaya-exhibition-name") ?? "[]");
      if (Array.isArray(names)) setSelectionName(names.filter((n): n is string => typeof n === "string"));
    } catch { setIds([]); setChoosing(true); }
  }, []);
  const selection = useMemo(() => {
    const by = new Map(all.filter((w) => !isProjectWork(w)).map((w) => [w.id, w]));
    return (ids ?? []).flatMap((id) => { const w = by.get(id); return w ? [w] : []; });
  }, [all, ids]);
  const works = exhibitionPage(selection, page); const pages = exhibitionPageCount(selection.length);
  const hallName = selectionName[ru ? 0 : 1] ?? (ru ? "Подборка" : "Selection");
  const halls = [...genreTerms.map((t) => ({ key: `genre:${t.key}`, label: t[lang], ids: main.filter((w) => w.genre === t.key).map((w) => w.id), names: [t.ru, t.en] })), ...styleTerms.map((t) => ({ key: `style:${t.key}`, label: t[lang], ids: main.filter((w) => w.style === t.key).map((w) => w.id), names: [t.ru, t.en] }))];
  const reset = () => { setAuto(false); setIndex(-1); setResetKey((k) => k + 1); };
  const setSelection = (list: string[], names: string[]) => {
    setIds(list); setSelectionName(names); setPage(0); setChoosing(false); reset();
    sessionStorage.setItem(EXHIBITION_KEY, JSON.stringify(list)); sessionStorage.setItem("prosetskaya-exhibition-name", JSON.stringify(names));
  };
  const changePage = (p: number) => { setPage((p + pages) % pages); setIndex(-1); setResetKey((k) => k + 1); };
  const go = (d: number) => {
    if (!works.length) return;
    if (d > 0 && index >= works.length - 1) { if (pages > 1) { changePage(page + 1); setIndex(0); } else setIndex(0); }
    else if (d < 0 && index === 0 && pages > 1) { const p = (page - 1 + pages) % pages; changePage(p); setIndex(exhibitionPage(selection, p).length - 1); }
    else setIndex((index + d + works.length) % works.length);
  };
  useEffect(() => {
    if (paused) return;
    const next = () => { setAuto(false); changePage(page + 1); };
    const key = (e: KeyboardEvent) => { if (e.defaultPrevented) return; if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); if (e.key === "Escape") reset(); };
    window.addEventListener("gallery-next-hall", next); window.addEventListener("keydown", key);
    return () => { window.removeEventListener("gallery-next-hall", next); window.removeEventListener("keydown", key); };
  });
  useEffect(() => { if (!auto || paused) return; const t = window.setInterval(() => go(1), 5000); return () => window.clearInterval(t); });
  const dialogWork = dialog ? works[dialog.i] : undefined;
  const ready = genre.length + style.length > 0 && selected.length > 0;
  return <main className="fixed inset-0 bg-background text-foreground">
    {!choosing && works.length > 0 && <Suspense fallback={<p className="grid h-full place-items-center text-sm">{ru ? "Готовим зал…" : "Preparing the hall…"}</p>}>
      <div className="absolute inset-0"><VirtualGallery key={`${ids?.[0]}:${page}`} works={works} lang={lang} index={index} distance={distance} resetKey={resetKey} paused={paused} hallName={hallName} onIndex={(i, a) => { setIndex(i); setAuto(false); if (a === "inquiry" || a === "checkout") setDialog({ action: a, i }); else { setViewerAction(a); setViewerIndex(i); } }} /></div>
    </Suspense>}
    <header className="absolute inset-x-0 top-0 z-20 flex flex-wrap items-center justify-between gap-2 p-3 md:p-6">
      <Button asChild variant="editorial" className="bg-background/90 px-3 text-xs"><Link to="/" hash="works"><ArrowLeft />{ru ? "В коллекцию" : "Collection"}</Link></Button>
      {!choosing && <div className="flex min-w-0 flex-wrap gap-2"><Select value="selection" onValueChange={(v) => { const h = halls.find((h) => h.key === v); if (h) setSelection(h.ids, h.names); }}><SelectTrigger className="h-9 w-44 bg-background/90 text-xs" aria-label={ru ? "Выбрать зал" : "Choose hall"}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="selection">{hallName}</SelectItem>{halls.map((h) => <SelectItem key={h.key} value={h.key}>{h.label} · {h.ids.length}</SelectItem>)}</SelectContent></Select><Button variant="outline" size="sm" className="bg-background" onClick={() => { setAuto(false); setChoosing(true); }}><Layers />{ru ? "Выбрать работы" : "Choose artworks"}</Button></div>}
    </header>
    {(choosing || (ids !== null && !works.length)) && <div className="flex h-full items-center justify-center overflow-y-auto px-4 py-24"><section className="w-full max-w-3xl">
      <h1 className="font-display text-4xl">{ru ? "Виртуальная выставка" : "Virtual exhibition"}</h1>
      <div className="mt-8"><CollectionFilters position="top" lang={lang} genreTerms={genreTerms} styleTerms={styleTerms} genre={genre} style={style} onGenre={setGenre} onStyle={setStyle} query={query} onQuery={setQuery} /></div>
      <div className="mt-6 flex items-center justify-between gap-3"><span className="text-sm text-muted-foreground">{ru ? "Работ" : "Artworks"}: {ready ? selected.length : "—"}</span><Button disabled={!ready} onClick={() => setSelection(selected.map((w) => w.id), (["ru", "en"] as const).map((l) => [...genreTerms.filter((t) => genre.includes(t.key)), ...styleTerms.filter((t) => style.includes(t.key))].map((t) => t[l]).join(" · ")))}><Box />{ru ? "Войти в зал" : "Enter gallery"}</Button></div>
      {ready && <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-6">{selected.slice(0, 6).map((w) => <img key={w.id} src={w.image} alt={w[lang]} className="aspect-square w-full object-contain" />)}</div>}
    </section></div>}
    {!choosing && works.length > 0 && <footer className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 p-3 md:p-6">
      <div className="flex max-w-full items-center gap-1 bg-background/90 p-1" role="group" aria-label={ru ? "Расстояние до стены" : "Distance from wall"}>
        {([[0.55, ru ? "Близко" : "Close"], [1, ru ? "Средне" : "Medium"], [1.7, ru ? "Далеко" : "Far"]] as const).map(([v, l]) => <Button key={v} type="button" variant={distance === v ? "default" : "ghost"} size="sm" onClick={() => { setDistance(v); if (index < 0) setIndex(0); }} aria-pressed={distance === v}>{l}</Button>)}
      </div>
      <div className="flex max-w-full flex-wrap items-center justify-center gap-1 bg-background/90 p-1.5">
        <Button variant="ghost" size="icon" title={ru ? "Предыдущая работа" : "Previous artwork"} aria-label={ru ? "Предыдущая работа" : "Previous artwork"} onClick={() => { setAuto(false); go(-1); }}><ChevronLeft /></Button>
        <Button variant="ghost" size="icon" title={ru ? (auto ? "Пауза" : "Автоэкскурсия") : (auto ? "Pause" : "Auto tour")} aria-label={ru ? (auto ? "Пауза" : "Автоэкскурсия") : (auto ? "Pause" : "Auto tour")} onClick={() => { if (index < 0) setIndex(0); setAuto(!auto); }}>{auto ? <Pause /> : <Play />}</Button>
        <Button variant="ghost" size="icon" title={ru ? "Отойти назад" : "Step back"} aria-label={ru ? "Отойти назад" : "Step back"} onClick={reset}><Undo2 /></Button>
        <span className="px-2 text-xs tabular-nums">{index >= 0 ? page * EXHIBITION_MAX + index + 1 : "—"} / {selection.length}</span>
        <Button variant="ghost" size="icon" title={ru ? "Следующая работа" : "Next artwork"} aria-label={ru ? "Следующая работа" : "Next artwork"} onClick={() => { setAuto(false); go(1); }}><ChevronRight /></Button>
        {pages > 1 && <><span className="px-2 text-xs text-muted-foreground">{ru ? "Экспозиция" : "Exhibition"} {page + 1}/{pages}</span><Button variant="outline" size="sm" title={ru ? "Следующие картины" : "More artworks"} onClick={() => { setAuto(false); changePage(page + 1); }}><Layers />{ru ? "Ещё картины" : "More artworks"}</Button></>}
      </div>
    </footer>}
    {dialog?.action === "inquiry" && dialogWork && <InquiryDialog work={dialogWork} lang={lang} onClose={() => setDialog(null)} />}
    {dialog?.action === "checkout" && dialogWork && <CheckoutDialog work={dialogWork} price={shop?.prices[dialogWork.id] ?? null} online={!!shop?.online} onClose={() => setDialog(null)} />}
    {viewerIndex !== null && <ArtworkViewer works={works} index={viewerIndex} lang={lang} projects={projects} purchaseActions initialAction={viewerAction} onChange={(i) => { setViewerIndex(i); setIndex(i); }} onClose={() => { setViewerIndex(null); setViewerAction(undefined); }} />}
  </main>;
}
