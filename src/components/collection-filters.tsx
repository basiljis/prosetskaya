import { useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category, Lang } from "@/lib/artworks";
import { copy } from "@/lib/gallery-copy";
import type { CollectionMenuPosition } from "@/lib/collection-layout";
import type { Direction } from "@/lib/directions";
import type { Term } from "@/lib/genres";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CollectionFilters({ position, category, lang, directions, query, onQuery, onChange, genre = "all", style = "all", onGenre, onStyle, styleTerms = [] }: { styleTerms?: Term[]; genre?: string; style?: string; onGenre?: (g: string) => void; onStyle?: ((s: string) => void) | undefined; position: CollectionMenuPosition; category: Category; lang: Lang; directions: Direction[]; query: string; onQuery: (q: string) => void; onChange: (category: Category) => void }) {
  const t = copy[lang];
  const left = position === "left";
  const [open, setOpen] = useState(false);
  const visible = directions.filter((d) => !d.hidden);
  const current = visible.find((d) => d.key === category) ?? visible[0];
  const ph = lang === "ru" ? "Поиск по названию, году" : "Search title, year";
  return <div className={`sticky top-[120px] z-20 self-start border-y border-border bg-background py-2.5 lg:py-4 ${left ? "lg:top-[132px] lg:border-y-0 lg:border-r lg:pr-6" : ""}`} role="group" aria-label={t.practices}>
    {left && <p className="mb-4 hidden text-xs font-medium lg:block">{t.collection}</p>}
    <div className={`flex gap-2 ${left ? "lg:flex-col" : "lg:items-start"}`}>
      <Button variant="editorial" onClick={() => setOpen(!open)} aria-expanded={open} className="h-9 min-w-0 flex-1 justify-between rounded-full border border-primary px-4 text-xs md:hidden"><span className="truncate">{current?.[lang]}</span><ChevronDown className={`transition ${open ? "rotate-180" : ""}`} /></Button>
      <div className={`relative md:order-2 ${left ? "lg:order-none" : "md:ml-auto md:w-56"} w-[42%] md:w-56 ${left ? "lg:w-full" : ""}`}>
        <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input value={query} onChange={(e) => onQuery(e.target.value)} placeholder={ph} aria-label={ph} className="h-9 rounded-full bg-transparent pl-9 pr-8 text-xs shadow-none" />
        {query && <button type="button" onClick={() => onQuery("")} aria-label={lang === "ru" ? "Очистить" : "Clear"} className="absolute right-3 top-2.5 text-muted-foreground"><X className="size-4" /></button>}
      </div>
      <div className={`hidden min-w-0 flex-1 flex-wrap gap-2 md:flex ${left ? "lg:flex-col lg:flex-nowrap lg:gap-1" : ""}`}>
        {visible.map((d) => <Pill key={d.key} d={d} lang={lang} active={category === d.key} left={left} onClick={() => onChange(d.key)} />)}
      </div>
    </div>
    {onStyle && <div className={`mt-2 flex gap-2 ${left ? "lg:mt-4" : ""}`}>
      <Facet label={lang === "ru" ? "Направление" : "Style"} all={lang === "ru" ? "Все направления" : "All styles"} value={style} items={Object.fromEntries(styleTerms.filter((t) => !t.hidden).map((t) => [t.key, t]))} lang={lang} onChange={onStyle} />
    </div>}
    {open && <div className="mt-2 grid gap-1 border-t border-border pt-2 md:hidden">{visible.map((d) => <button key={d.key} type="button" onClick={() => { onChange(d.key); setOpen(false); }} aria-pressed={category === d.key} className={`border-l-2 px-3 py-2 text-left text-sm ${category === d.key ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>{d[lang]}</button>)}</div>}
  </div>;
}

function Pill({ d, lang, active, left, onClick }: { d: Direction; lang: Lang; active: boolean; left: boolean; onClick: () => void }) {
  return <Button variant="editorial" onClick={onClick} aria-pressed={active} className={`h-8 shrink-0 whitespace-nowrap rounded-full border px-3.5 text-[11px] font-medium transition-colors lg:text-xs ${active ? "border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground" : "border-border text-muted-foreground hover:border-primary hover:text-primary"} ${left ? "lg:justify-start lg:rounded-none lg:border-0 lg:border-l-2 lg:bg-transparent lg:px-3 lg:shadow-none" : ""} ${left && active ? "lg:border-primary lg:text-primary lg:hover:bg-transparent lg:hover:text-primary" : ""}`}>{d[lang]}</Button>;
}

function Facet({ label, all, value, items, lang, onChange }: { label: string; all: string; value: string; items: Record<string, { ru: string; en: string }>; lang: Lang; onChange: (v: string) => void }) {
  return <Select value={value} onValueChange={onChange}><SelectTrigger aria-label={label} className={`h-9 w-full rounded-full bg-transparent px-4 text-xs shadow-none md:w-48 ${value !== "all" ? "border-primary text-primary" : ""}`}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{all}</SelectItem>{Object.entries(items).map(([k, v]) => <SelectItem key={k} value={k}>{v[lang]}</SelectItem>)}</SelectContent></Select>;
}
