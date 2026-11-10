import type { Artwork, Lang } from "@/lib/artworks";
import { artworkSizeCm, boutique, ROOM_WALL_CM } from "@/lib/boutique";

/** Painting hung above a sofa; widths are proportional to a wall of ROOM_WALL_CM. */
export function RoomPreview({ work, lang }: { work: Artwork; lang: Lang }) {
  const { w, h } = artworkSizeCm(work);
  const pct = (cm: number) => `${(cm / ROOM_WALL_CM) * 100}%`;
  return (
    <div className="room-wall relative aspect-[16/9] w-full max-w-5xl overflow-hidden">
      <div className="absolute left-1/2 -translate-x-1/2 shadow-2xl" style={{ width: pct(w), aspectRatio: `${w} / ${h}`, bottom: "38%" }}>
        <img src={work.image} alt={work[lang]} className="h-full w-full object-cover" />
      </div>
      <div className="room-sofa absolute bottom-[12%] left-1/2 h-[24%] -translate-x-1/2 rounded-t-2xl" style={{ width: pct(220) }} />
      <div className="room-floor absolute inset-x-0 bottom-0 h-[12%]" />
      <p className="absolute bottom-2 left-3 text-[10px] text-muted-foreground">{w} × {h} см · {boutique[lang].roomHint}</p>
    </div>
  );
}
