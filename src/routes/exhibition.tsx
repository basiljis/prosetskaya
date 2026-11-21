import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, Undo2, ChevronRight, Pause, Play } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { ArtworkCaption } from "@/components/artwork-caption";
import { Button } from "@/components/ui/button";
import { useArtworks } from "@/hooks/use-artworks";
import type { Lang } from "@/lib/artworks";
import { genres, genreLabel } from "@/lib/genres";
import { EXHIBITION_LIMIT } from "@/lib/exhibition-layout";

const VirtualGallery = lazy(() => import("@/components/virtual-gallery").then((m) => ({ default: m.VirtualGallery })));
export const EXHIBITION_KEY = "prosetskaya-exhibition";
export const EXHIBITION_MAX = EXHIBITION_LIMIT;

export const Route = createFileRoute("/exhibition")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Виртуальная выставка — Юлия Просецкая" },
    { name: "description", content: "Прогулка по виртуальному выставочному залу с выбранными работами Юлии Просецкой." },
    { property: "og:title", content: "Виртуальная выставка Юлии Просецкой" },
    { property: "og:description", content: "Выберите работы в коллекции и осмотрите их в трёхмерном зале." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Exhibition,
});

const ru0 = (l: Lang) => l === "ru";

function Exhibition() {
  const all = useArtworks();
  const [lang, setLang] = useState<Lang>("ru");
  const [ids, setIds] = useState<string[] | null>(null);
  const [index, setIndex] = useState(-1);
  const [auto, setAuto] = useState(false);
  const [distance, setDistance] = useState(1);
  const [resetKey, setResetKey] = useState(0);
  const overview = () => { setAuto(false); setIndex(-1); setResetKey((k) => k + 1); };
  useEffect(() => {
    setLang(localStorage.getItem("prosetskaya-lang") === "en" ? "en" : "ru");
    try { setIds(JSON.parse(sessionStorage.getItem(EXHIBITION_KEY) ?? "[]")); } catch { setIds([]); }
  }, []);
  const works = useMemo(() => {
    const by = new Map(all.map((w) => [w.id, w]));
    const list = (ids ?? []).map((id) => by.get(id)).filter((w) => !!w);
    return list.slice(0, EXHIBITION_MAX);
  }, [all, ids]);
  // Halls: one per genre that has works, like the collection menu; "own" is the visitor's own selection.
  const [own, setOwn] = useState<string[] | null>(null);
  useEffect(() => { if (ids && own === null) setOwn(ids); }, [ids, own]);
  const halls = useMemo(() => [
    ...(own && own.length ? [{ key: "own", label: ru0(lang) ? "Ваш выбор" : "Your selection", ids: own }] : []),
    ...Object.keys(genres).map((g) => ({ key: g, label: genreLabel(g, lang), ids: all.filter((w) => w.genre === g).slice(0, EXHIBITION_MAX).map((w) => w.id) })).filter((h) => h.ids.length > 0),
  ], [all, own, lang]);
  const [hall, setHall] = useState("own");
  const enterHall = (key: string) => {
    const h = halls.find((x) => x.key === key); if (!h) return;
    setHall(key); setIds(h.ids); sessionStorage.setItem(EXHIBITION_KEY, JSON.stringify(h.ids)); setAuto(false); setIndex(-1); setResetKey((k) => k + 1);
  };
  useEffect(() => {
    const next = () => { const i = halls.findIndex((h) => h.key === hall); const n = halls[(i + 1) % halls.length]; if (n) enterHall(n.key); };
    window.addEventListener("gallery-next-hall", next); return () => window.removeEventListener("gallery-next-hall", next);
  });
  const go = (d: number) => setIndex((i) => (i + d + works.length) % works.length);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); if (e.key === "Escape") overview(); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });
  useEffect(() => { if (!auto) return; const t = setInterval(() => go(1), 5000); return () => clearInterval(t); });
  const ru = lang === "ru";
  const work = works[index];
  return <main className="fixed inset-0 bg-background text-foreground">
    {ids !== null && works.length === 0 && <div className="grid h-full place-items-center p-6 text-center"><div><p className="font-display text-3xl">{ru ? "Выберите работы для выставки" : "Choose works for the exhibition"}</p><p className="mt-3 text-sm text-muted-foreground">{ru ? "Отметьте жанр или направление в коллекции, затем нажмите значок выставки." : "Pick a genre or style in the collection, then press the exhibition icon."}</p><Button asChild className="mt-6"><Link to="/" hash="works">{ru ? "К коллекции" : "To the collection"}</Link></Button></div></div>}
    {ids !== null && works.length > 0 && <Suspense fallback={<p className="grid h-full place-items-center text-sm text-muted-foreground">{ru ? "Готовим зал…" : "Preparing the hall…"}</p>}>
      <div className="absolute inset-0"><VirtualGallery works={works} lang={lang} index={index} distance={distance} resetKey={resetKey} hallName={halls.find((h) => h.key === hall)?.label ?? ""} onIndex={(i) => { setIndex(i); setAuto(false); }} /></div>
    </Suspense>}
    <header className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-4 md:p-6">
      <Button asChild variant="editorial" className="pointer-events-auto bg-background/85 px-3 text-xs backdrop-blur"><Link to="/" hash="works"><ArrowLeft />{ru ? "В коллекцию" : "Collection"}</Link></Button>
      <label className="pointer-events-auto flex items-center gap-2 bg-background/85 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] backdrop-blur" title={ru ? "Перейти в другой зал" : "Go to another hall"}>
        <span className="hidden sm:inline">{ru ? "Зал" : "Hall"}</span>
        <select value={hall} onChange={(e) => enterHall(e.target.value)} aria-label={ru ? "Выбрать зал" : "Choose hall"} className="cursor-pointer bg-transparent py-0.5 text-[11px] uppercase tracking-[0.15em] outline-none">
          {halls.map((h) => <option key={h.key} value={h.key}>{h.label} · {h.ids.length}</option>)}
        </select>
      </label>
    </header>
    <footer className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 p-4 md:p-6">
      {work ? <div className="w-[min(92vw,420px)] bg-background/90 p-4 shadow-lg backdrop-blur"><ArtworkCaption work={work} lang={lang} /></div>
        : <p className="bg-background/85 px-4 py-2 text-center text-xs text-muted-foreground backdrop-blur">{ru ? "Тяните или крутите колёсико (↑↓) · нажмите на пол, картину или дверь — следующий зал" : "Drag or scroll (↑↓) · click the floor, a painting, or the door for the next hall"}</p>}
      <div className="flex items-center gap-1 rounded-full bg-background/90 p-1 text-[11px] shadow-lg backdrop-blur" role="group" aria-label={ru ? "Расстояние до стены" : "Distance from wall"}>
        <span className="px-2 text-muted-foreground">{ru ? "Расстояние" : "Distance"}</span>
        {([[0.55, ru ? "Близко" : "Close"], [1, ru ? "Средне" : "Medium"], [1.7, ru ? "Далеко" : "Far"]] as const).map(([v, l]) => <button key={v} type="button" onClick={() => { setDistance(v); if (index < 0) setIndex(0); }} aria-pressed={distance === v} className={`rounded-full px-3 py-1.5 transition-colors ${distance === v ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{l}</button>)}
      </div>
      <div className="flex items-center gap-2 rounded-full bg-background/90 p-1.5 shadow-lg backdrop-blur">
        <Button variant="ghost" size="icon" className="rounded-full" aria-label={ru ? "Предыдущая работа" : "Previous artwork"} onClick={() => { setAuto(false); go(-1); }}><ChevronLeft /></Button>
        <Button variant="ghost" className="rounded-full px-4 text-xs" onClick={() => { if (index < 0) setIndex(0); setAuto(!auto); }}>{auto ? <Pause /> : <Play />}{auto ? (ru ? "Пауза" : "Pause") : (ru ? "Экскурсия" : "Tour")}</Button>
        <Button variant="ghost" size="icon" className="rounded-full" title={ru ? "Отойти назад — общий вид зала" : "Step back — hall overview"} aria-label={ru ? "Отойти назад" : "Step back"} onClick={overview}><Undo2 /></Button>
        <span className="min-w-14 text-center text-[11px] text-muted-foreground">{index + 1 > 0 ? index + 1 : "—"} / {works.length}</span>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label={ru ? "Следующая работа" : "Next artwork"} onClick={() => { setAuto(false); go(1); }}><ChevronRight /></Button>
      </div>
    </footer>
  </main>;
}
