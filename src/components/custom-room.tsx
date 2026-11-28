import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ImagePlus, Move, RotateCcw, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { artworkSizeCm } from "@/lib/boutique";
import { calibrationScale } from "@/lib/designer-filters";
import type { Artwork, Lang } from "@/lib/artworks";

type Point = { x: number; y: number };
export function CustomRoom({ work, lang }: { work: Artwork; lang: Lang }) {
  const ru = lang === "ru";
  const [photo, setPhoto] = useState<string | null>(null);
  const [ratio, setRatio] = useState(1.5);
  const [cm, setCm] = useState("300");
  const [reference, setReference] = useState("wall");
  const [points, setPoints] = useState<Point[]>([]);
  const [marking, setMarking] = useState(true);
  const [position, setPosition] = useState<Point>({ x: 0.5, y: 0.4 });
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1);
  const dimensions = artworkSizeCm(work);
  useEffect(() => { if (!photo) return; return () => URL.revokeObjectURL(photo); }, [photo]);
  useEffect(() => {
    const el = stage.current; if (!el) return;
    const observer = new ResizeObserver(() => setWidth(el.clientWidth)); observer.observe(el);
    return () => observer.disconnect();
  }, [photo]);
  const a = points[0], b = points[1];
  const scale = a && b ? calibrationScale(a, b, Number(cm), width) : null;
  const point = (e: PointerEvent<HTMLElement>): Point => {
    const box = stage.current?.getBoundingClientRect();
    return box ? { x: Math.max(0, Math.min(1, (e.clientX - box.left) / box.width)), y: Math.max(0, Math.min(1, (e.clientY - box.top) / box.height)) } : position;
  };
  return <div className="flex w-full max-w-5xl flex-col gap-3">
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap">
      <Button variant="outline" size="sm" onClick={() => input.current?.click()}><ImagePlus />{ru ? "Загрузить фото" : "Upload photo"}</Button>
      <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => {
        const file = e.target.files?.[0]; if (!file) return;
        if (!file.type.startsWith("image/") || file.size > 20 * 1024 * 1024) { setError(ru ? "Выберите изображение до 20 МБ." : "Choose an image under 20 MB."); return; }
        setError(""); setPhoto(URL.createObjectURL(file)); setPoints([]); setMarking(true);
      }} />
      <span className="min-w-0 text-xs opacity-60">{ru ? "Фото остаётся на вашем устройстве" : "Photo stays on your device"}</span>
    </div>
    {photo && <>
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs">{ru ? "Масштаб по" : "Reference"}<select value={reference} onChange={(e) => { setReference(e.target.value); setPoints([]); setMarking(true); }} className="mt-1 block h-9 border border-current/25 bg-background px-2 text-foreground"><option value="wall">{ru ? "Ширине стены" : "Wall width"}</option><option value="object">{ru ? "Размеру объекта" : "Object dimension"}</option></select></label>
        <label className="w-24 text-xs">{ru ? "Размер, см" : "Size, cm"}<Input type="number" min="1" max="10000" value={cm} onChange={(e) => setCm(e.target.value)} className="mt-1 h-9 bg-background text-foreground" /></label>
        <Button variant="outline" size="sm" onClick={() => { setPoints([]); setMarking(true); }}><Ruler />{ru ? "Отметить края" : "Mark endpoints"}</Button>
        <Button variant={marking ? "outline" : "default"} disabled={!scale} size="sm" onClick={() => setMarking(false)}><Move />{ru ? "Разместить картину" : "Place painting"}</Button>
        <Button variant="artwork" size="icon" title={ru ? "В центр" : "Center painting"} onClick={() => setPosition({ x: 0.5, y: 0.4 })}><RotateCcw /></Button>
      </div>
      <p className="text-xs opacity-70">{marking ? (ru ? "Отметьте два края стены или объекта с известным размером." : "Mark both ends of the wall or object with a known dimension.") : (ru ? "Перетащите картину на стену. Масштаб приблизительный при перспективе фотографии." : "Drag the painting onto the wall. Perspective can affect scale.")}</p>
      <div ref={stage} className="relative mx-auto w-full max-w-full overflow-hidden touch-none" style={{ aspectRatio: ratio, maxHeight: "52dvh", maxWidth: `calc(52dvh * ${ratio})` }} onPointerDown={(e) => {
        if (marking) { const next = points.length < 2 ? [...points, point(e)] : [point(e)]; setPoints(next); if (next.length === 2) setMarking(false); }
        else { e.currentTarget.setPointerCapture(e.pointerId); setPosition(point(e)); }
      }} onPointerMove={(e) => { if (!marking && e.currentTarget.hasPointerCapture(e.pointerId)) setPosition(point(e)); }} onPointerUp={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); }}>
        <img src={photo} alt={ru ? "Ваш интерьер" : "Your interior"} onLoad={(e) => setRatio(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)} className="absolute inset-0 h-full w-full object-contain" draggable={false} />
        {points.map((p, i) => <span key={i} className="absolute z-10 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-primary-foreground" style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }} />)}
        {scale && <img src={work.image} alt={work[lang]} draggable={false} className="room-artwork absolute -translate-x-1/2 -translate-y-1/2 object-contain" style={{ left: `${position.x * 100}%`, top: `${position.y * 100}%`, width: `${dimensions.w * scale}px`, height: `${dimensions.h * scale}px` }} />}
      </div>
      {!work.size.trim() && <p className="text-xs text-destructive">{ru ? "Размер работы не указан: используется условный размер 60 см." : "Artwork size unknown: using an estimated 60 cm size."}</p>}
    </>}
    {!photo && <div className="grid min-h-48 place-items-center border border-dashed border-current/30"><ImagePlus className="size-10 opacity-40" /></div>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </div>;
}
