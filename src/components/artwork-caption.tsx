import type { ReactNode } from "react";
import type { Artwork, Lang } from "@/lib/artworks";
import { cn } from "@/lib/utils";

/** Gallery "sold" convention: a red dot. */
export function SoldDot({ className }: { className?: string }) {
  return <span aria-hidden className={cn("inline-block size-2.5 shrink-0 rounded-full bg-destructive", className)} />;
}

export function ArtworkCaption({ work, lang, className, aside }: { work: Artwork; lang: Lang; className?: string; aside?: ReactNode }) {
  const medium = lang === "ru" ? work.mediumRu : work.mediumEn;
  const details = [medium, work.size ? `${work.size.replace(/\s*см$/, "")} ${lang === "ru" ? "см" : "cm"}` : "", work.year ? (lang === "ru" ? `${work.year} год` : work.year) : ""].filter(Boolean).join(" · ");
  const sold = work.sourceAvailability === "sold";
  return (
    <div className={cn("grid grid-cols-[minmax(0,1fr)_auto] gap-4 font-sans", className)}>
      <div className="min-w-0">
        <h3 className="flex items-center gap-2 text-sm font-medium leading-6">{sold && <SoldDot />}{sold && <span className="sr-only">{lang === "ru" ? "Продана:" : "Sold:"}</span>}<span className="min-w-0">{work[lang]}</span></h3>
        <p className="mt-1 text-[11px] leading-5 opacity-60">{details}</p>
      </div>
      {aside}
    </div>
  );
}
