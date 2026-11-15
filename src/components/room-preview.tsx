import { useState } from "react";
import type { Artwork, Lang } from "@/lib/artworks";
import { artworkSizeCm, boutique, ROOMS } from "@/lib/boutique";
import living from "@/assets/room-living.jpg.asset.json";
import dining from "@/assets/room-dining.jpg.asset.json";
import livingPortrait from "@/assets/room-living-portrait.jpg.asset.json";
import diningPortrait from "@/assets/room-dining-portrait.jpg.asset.json";
import { useIsMobile } from "@/hooks/use-mobile";

const photos = { living: living.url, dining: dining.url } as const;
const portraitPhotos = { living: livingPortrait.url, dining: diningPortrait.url } as const;

/** Painting hung on a magazine-style interior photo, scaled to the room's real wall width. */
export function RoomPreview({ work, lang }: { work: Artwork; lang: Lang }) {
  const [roomIndex, setRoomIndex] = useState(0);
  const base = ROOMS[roomIndex] ?? ROOMS[0];
  const vertical = useIsMobile();
  const room = vertical ? { ...base, ...base.portrait } : base;
  const { w, h } = artworkSizeCm(work);
  return (
    <figure className="flex w-full max-w-6xl flex-col items-center gap-3">
      <div className={`relative w-full overflow-hidden ${vertical ? "aspect-[1088/1600] max-h-[70vh] max-w-[calc(70vh*0.68)]" : "aspect-[1920/1088] max-h-full"}`}>
        <img src={(vertical ? portraitPhotos : photos)[room.id]} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div
          className="room-artwork absolute left-1/2 -translate-x-1/2"
          style={{ width: `${(w / room.wallCm) * 100}%`, aspectRatio: `${w} / ${h}`, bottom: `${room.bottomPct}%` }}
        >
          <img src={work.image} alt={work[lang]} className="h-full w-full object-cover" />
        </div>
      </div>
      <figcaption className="flex w-full flex-wrap items-center justify-between gap-3 text-[11px]">
        <span className="opacity-60">{w} × {h} см · {boutique[lang].roomHint}</span>
        <span className="flex gap-4">
          {ROOMS.map((r, i) => (
            <button key={r.id} type="button" onClick={() => setRoomIndex(i)} aria-pressed={i === roomIndex} className={`border-b-2 pb-0.5 ${i === roomIndex ? "border-primary" : "border-transparent opacity-60"}`}>{r[lang]}</button>
          ))}
        </span>
      </figcaption>
    </figure>
  );
}
