import { Button } from "@/components/ui/button";
import { categories, type Category, type Lang } from "@/lib/artworks";
import { copy } from "@/lib/gallery-copy";
import type { CollectionMenuPosition } from "@/lib/collection-layout";

export function CollectionFilters({ position, category, lang, onChange }: { position: CollectionMenuPosition; category: Category; lang: Lang; onChange: (category: Category) => void }) {
  const t = copy[lang];
  const left = position === "left";
  return <div className={`sticky top-[76px] z-30 self-start border-y border-border bg-background/95 py-4 backdrop-blur-lg ${left ? "lg:top-[100px] lg:border-y-0 lg:border-r lg:pr-6" : ""}`} role="group" aria-label={t.practices}>
    {left && <p className="mb-4 hidden text-xs font-medium lg:block">{t.collection}</p>}
    <div className={`flex flex-wrap gap-x-7 gap-y-2 ${left ? "lg:flex-col lg:flex-nowrap lg:gap-1" : ""}`}>
      {categories.map((key) => <Button key={key} variant="editorial" onClick={() => onChange(key)} aria-pressed={category === key} className={`relative h-auto min-h-8 whitespace-normal px-0 py-2 text-left text-[11px] ${category === key ? "text-primary" : "text-muted-foreground"} ${left ? "lg:justify-start lg:text-xs" : ""}`}>{category === key && <span className="size-1 shrink-0 rounded-full bg-primary" />}{t.categories[key]}</Button>)}
    </div>
  </div>;
}