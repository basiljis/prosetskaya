import type { Artwork, Lang } from "@/lib/artworks";
import { cn } from "@/lib/utils";

export function ArtworkCaption({ work, lang, className }: { work: Artwork; lang: Lang; className?: string }) {
  const medium = lang === "ru" ? work.mediumRu : work.mediumEn;
  const details = [medium, work.size ? `${work.size} ${lang === "ru" ? "см" : "cm"}` : ""].filter(Boolean).join(" · ");
  return (
    <div className={cn("grid grid-cols-[minmax(0,1fr)_auto] gap-4 font-sans", className)}>
      <div className="min-w-0">
        <h3 className="text-sm font-medium leading-6">{work[lang]}</h3>
        <p className="mt-1 text-[11px] leading-5 opacity-60">{details}</p>
      </div>
      {work.year && <span className="pt-1 text-[11px] tabular-nums opacity-60">{work.year}</span>}
    </div>
  );
}