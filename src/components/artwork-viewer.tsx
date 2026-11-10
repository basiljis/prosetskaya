import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArtworkCaption } from "@/components/artwork-caption";
import { type Artwork, type Lang } from "@/lib/artworks";
import { copy } from "@/lib/gallery-copy";
import { nextArtworkIndex } from "@/lib/gallery-navigation";
import { availability, boutique } from "@/lib/boutique";
import { RoomPreview } from "@/components/room-preview";
import { InquiryDialog } from "@/components/inquiry-dialog";

const backgrounds = [
  { surface: "bg-viewer-light text-viewer-light-foreground", swatch: "bg-viewer-light", label: "lightBg" },
  { surface: "bg-viewer-dark text-viewer-dark-foreground", swatch: "bg-viewer-dark", label: "darkBg" },
  { surface: "bg-viewer-gray text-viewer-gray-foreground", swatch: "bg-viewer-gray", label: "grayBg" },
] as const;

export function ArtworkViewer({ works, index, lang, onChange, onClose }: {
  works: readonly Artwork[]; index: number; lang: Lang; onChange: (index: number) => void; onClose: () => void;
}) {
  const [background, setBackground] = useState(1);
  const [room, setRoom] = useState(false);
  const [inquiry, setInquiry] = useState(false);
  const b = boutique[lang];
  const work = works[index];
  const t = copy[lang];
  const go = useCallback((direction: number) => onChange(nextArtworkIndex(index, direction, works.length)), [index, works.length, onChange]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (inquiry) return;
      if (event.key === "ArrowLeft") { event.preventDefault(); go(-1); }
      if (event.key === "ArrowRight") { event.preventDefault(); go(1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, inquiry]);

  if (!work) return null;
  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Content aria-describedby="artwork-details" className={`viewer-surface fixed inset-0 z-[90] flex h-dvh flex-col transition-colors duration-300 ${backgrounds[background]?.surface ?? backgrounds[0].surface}`}>
          <Dialog.Title className="sr-only">{work[lang]}</Dialog.Title>
          <Dialog.Description className="sr-only">{work[lang]} — {lang === "ru" ? work.mediumRu : work.mediumEn}</Dialog.Description>
          <div className="flex h-20 shrink-0 items-center justify-between gap-3 px-5 md:px-10">
            <div className="flex items-center gap-3">
              <span className="hidden text-[10px] uppercase opacity-60 sm:inline">{t.background}</span>
              {backgrounds.map((bg, i) => <Button key={bg.label} variant="artwork" size="icon" onClick={() => setBackground(i)} aria-label={t[bg.label]} aria-pressed={background === i} title={t[bg.label]} className={`size-7 rounded-full border border-current ${bg.swatch} ${background === i ? "outline outline-1 outline-offset-4" : ""}`} />)}
            </div>
            <Button variant="artwork" onClick={() => setRoom(!room)} aria-pressed={room} className={`border px-3 py-1 text-[11px] ${room ? "border-current" : "border-transparent opacity-70"}`}>{b.room}</Button>
            <span className="hidden text-[11px] tabular-nums sm:inline opacity-60">{String(index + 1).padStart(2, "0")} / {String(works.length).padStart(2, "0")}</span>
            <Button variant="artwork" size="icon" onClick={onClose} aria-label={t.close} title={t.close}><X className="size-6" /></Button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-12 py-3 md:px-24">
            <Button variant="artwork" size="icon" className="absolute left-1 size-10 md:left-8" onClick={() => go(-1)} aria-label={t.previous} title={t.previous}><ArrowLeft className="size-6" /></Button>
            {room ? <RoomPreview work={work} lang={lang} /> : <img src={work.image} alt={work[lang]} className="viewer-image" />}
            <Button variant="artwork" size="icon" className="absolute right-1 size-10 md:right-8" onClick={() => go(1)} aria-label={t.next} title={t.next}><ArrowRight className="size-6" /></Button>
          </div>
          <div id="artwork-details" className="grid shrink-0 gap-4 border-t border-current/15 px-5 py-6 md:grid-cols-[1fr_auto] md:items-center md:gap-16 md:px-10">
            <ArtworkCaption work={work} lang={lang} className="max-w-xl" />
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <span className="text-[10px] opacity-60">{availability(work) === "print" ? b.print : b.original}</span>
              <Button variant="artwork" onClick={() => setInquiry(true)} className="border border-current px-4 py-2 text-xs">{b.inquire}<ArrowUpRight /></Button>
            </div>
          </div>
          {inquiry && <InquiryDialog work={work} lang={lang} onClose={() => setInquiry(false)} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}