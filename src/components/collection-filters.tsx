import { Button } from "@/components/ui/button";
import { categories, type Category, type Lang } from "@/lib/artworks";
import { copy } from "@/lib/gallery-copy";
import type { CollectionMenuPosition } from "@/lib/collection-layout";

export function CollectionFilters({ position, category, lang, onChange }: { position: CollectionMenuPosition; category: Category; lang: Lang; onChange: (category: Category) => void }) {
  const t = copy[lang];
  const left = position === "left";
  return <div className={`sticky top-[120px] z-20 self-start border-y border-border bg-background/95 py-2.5 backdrop-blur-lg lg:py-4 ${left ? "lg:top-[132px] lg:border-y-0 lg:border-r lg:pr-6" : ""}`} role="group" aria-label={t.practices}>
    {left && <p className="mb-4 hidden text-xs font-medium lg:block">{t.collection}</p>}
    <div className={`filter-scroll -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0 lg:flex-wrap lg:gap-x-2 lg:gap-y-2 ${left ? "lg:flex-col lg:flex-nowrap lg:gap-1" : ""}`}>
      {categories.map((key) => <Button key={key} variant="editorial" onClick={() => onChange(key)} aria-pressed={category === key} className={`h-8 shrink-0 whitespace-nowrap rounded-full border px-3.5 text-[11px] font-medium transition-colors lg:text-xs ${category === key ? "border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground" : "border-border text-muted-foreground hover:border-primary hover:text-primary"} ${left ? "lg:justify-start lg:rounded-none lg:border-0 lg:border-l-2 lg:bg-transparent lg:px-3 lg:shadow-none" : ""} ${left && category === key ? "lg:border-primary lg:text-primary lg:hover:bg-transparent lg:hover:text-primary" : ""}`}>{t.categories[key]}</Button>)}
    </div>
  </div>;
}