import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { ArtworkCaption } from "@/components/artwork-caption";
import { Button } from "@/components/ui/button";
import { useArtworks } from "@/hooks/use-artworks";
import type { Lang } from "@/lib/artworks";

const VirtualGallery = lazy(() => import("@/components/virtual-gallery").then((m) => ({ default: m.VirtualGallery })));
export const EXHIBITION_KEY = "prosetskaya-exhibition";
export const EXHIBITION_MAX = 30;

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

function Exhibition() {
  const all = useArtworks();
  const [lang, setLang] = useState<Lang>("ru");
  const [ids, setIds] = useState<string[] | null>(null);
  const [index, setIndex] = useState(-1);
  const [auto, setAuto] = useState(false);
  useEffect(() => {
    setLang(localStorage.getItem("prosetskaya-lang") === "en" ? "en" : "ru");
    try { setIds(JSON.parse(sessionStorage.getItem(EXHIBITION_KEY) ?? "[]")); } catch { setIds([]); }
  }, []);
  const works = useMemo(() => {
    const by = new Map(all.map((w) => [w.id, w]));
    const list = (ids?.length ? ids.map((id) => by.get(id)).filter((w) => !!w) : all.slice(0, 16));
    return list.slice(0, EXHIBITION_MAX);
  }, [all, ids]);
  const go = (d: number) => setIndex((i) => (i + d + works.length) % works.length);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); if (e.key === "Escape") setIndex(-1); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });
  useEffect(() => { if (!auto) return; const t = setInterval(() => go(1), 5000); return () => clearInterval(t); });
  const ru = lang === "ru";
  const work = works[index];
  return <main className="fixed inset-0 bg-background text-foreground">
    {ids !== null && <Suspense fallback={<p className="grid h-full place-items-center text-sm text-muted-foreground">{ru ? "Готовим зал…" : "Preparing the hall…"}</p>}>
      <div className="absolute inset-0"><VirtualGallery works={works} lang={lang} index={index} onIndex={(i) => { setIndex(i); setAuto(false); }} /></div>
    </Suspense>}
    <header className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-4 md:p-6">
      <Button asChild variant="editorial" className="pointer-events-auto bg-background/85 px-3 text-xs backdrop-blur"><Link to="/" hash="works"><ArrowLeft />{ru ? "В коллекцию" : "Collection"}</Link></Button>
      <p className="bg-background/85 px-3 py-2 text-[11px] uppercase tracking-[0.2em] backdrop-blur">{ru ? "Виртуальная выставка" : "Virtual exhibition"} · {works.length}</p>
    </header>
    <footer className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 p-4 md:p-6">
      {work ? <div className="w-[min(92vw,420px)] bg-background/90 p-4 shadow-lg backdrop-blur"><ArtworkCaption work={work} lang={lang} /></div>
        : <p className="bg-background/85 px-4 py-2 text-center text-xs text-muted-foreground backdrop-blur">{ru ? "Нажмите на картину или начните экскурсию" : "Click a painting or start the tour"}</p>}
      <div className="flex items-center gap-2 rounded-full bg-background/90 p-1.5 shadow-lg backdrop-blur">
        <Button variant="ghost" size="icon" className="rounded-full" aria-label={ru ? "Предыдущая работа" : "Previous artwork"} onClick={() => { setAuto(false); go(-1); }}><ChevronLeft /></Button>
        <Button variant="ghost" className="rounded-full px-4 text-xs" onClick={() => { if (index < 0) setIndex(0); setAuto(!auto); }}>{auto ? <Pause /> : <Play />}{auto ? (ru ? "Пауза" : "Pause") : (ru ? "Экскурсия" : "Tour")}</Button>
        <span className="min-w-14 text-center text-[11px] text-muted-foreground">{index + 1 > 0 ? index + 1 : "—"} / {works.length}</span>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label={ru ? "Следующая работа" : "Next artwork"} onClick={() => { setAuto(false); go(1); }}><ChevronRight /></Button>
      </div>
    </footer>
  </main>;
}
