import { ChevronDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Lang } from "@/lib/artworks";
import { copy } from "@/lib/gallery-copy";
import type { CollectionMenuPosition } from "@/lib/collection-layout";
import type { Term } from "@/lib/genres";

type Props = { position: CollectionMenuPosition; lang: Lang; genreTerms: Term[]; styleTerms: Term[] | null; genre: string[]; style: string[]; onGenre: (v: string[]) => void; onStyle: (v: string[]) => void; query: string; onQuery: (q: string) => void };

/** Collection filters: multi-select dropdowns for genre and style plus search. */
export function CollectionFilters({ position, lang, genreTerms, styleTerms, genre, style, onGenre, onStyle, query, onQuery }: Props) {
  const t = copy[lang];
  const left = position === "left";
  const ru = lang === "ru";
  const ph = ru ? "Поиск по названию, году" : "Search title, year";
  const any = genre.length + style.length > 0;
  return <div className={`sticky top-[120px] z-20 self-start border-y border-border bg-background py-2.5 lg:py-4 ${left ? "lg:top-[132px] lg:border-y-0 lg:border-r lg:pr-6" : ""}`} role="group" aria-label={t.practices}>
    {left && <p className="mb-4 hidden text-xs font-medium lg:block">{t.collection}</p>}
    <div className={`flex flex-wrap items-center gap-2 ${left ? "lg:flex-col lg:items-stretch" : ""}`}>
      <Multi label={ru ? "Жанр" : "Genre"} all={ru ? "Все жанры" : "All genres"} terms={genreTerms} value={genre} onChange={onGenre} lang={lang} />
      {styleTerms && <Multi label={ru ? "Направление" : "Style"} all={ru ? "Все направления" : "All styles"} terms={styleTerms} value={style} onChange={onStyle} lang={lang} />}
      {any && <button type="button" onClick={() => { onGenre([]); onStyle([]); }} className="px-2 text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline">{ru ? "Сбросить" : "Reset"}</button>}
      <div className={`relative w-full sm:w-56 ${left ? "lg:w-full" : "sm:ml-auto"}`}>
        <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input value={query} onChange={(e) => onQuery(e.target.value)} placeholder={ph} aria-label={ph} className="h-9 rounded-full bg-transparent pl-9 pr-8 text-xs shadow-none" />
        {query && <button type="button" onClick={() => onQuery("")} aria-label={ru ? "Очистить" : "Clear"} className="absolute right-3 top-2.5 text-muted-foreground"><X className="size-4" /></button>}
      </div>
    </div>
  </div>;
}

function Multi({ label, all, terms, value, onChange, lang }: { label: string; all: string; terms: Term[]; value: string[]; onChange: (v: string[]) => void; lang: Lang }) {
  const active = value.length > 0;
  const names = terms.filter((t) => value.includes(t.key)).map((t) => t[lang]);
  const text = !active ? all : names.length === 1 ? names[0] : `${label} · ${names.length}`;
  const toggle = (k: string) => onChange(value.includes(k) ? value.filter((v) => v !== k) : [...value, k]);
  return <Popover>
    <PopoverTrigger asChild>
      <Button variant="editorial" aria-label={label} className={`h-9 min-w-0 flex-1 justify-between gap-2 rounded-full border px-4 text-xs sm:flex-none sm:min-w-44 ${active ? "border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "border-border text-muted-foreground hover:border-primary hover:text-primary"}`}><span className="truncate">{text}</span><ChevronDown className="size-4 shrink-0" /></Button>
    </PopoverTrigger>
    <PopoverContent align="start" className="w-64 p-2">
      <button type="button" onClick={() => onChange([])} className={`w-full rounded-sm px-2 py-2 text-left text-sm ${!active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>{all}</button>
      <div className="my-1 border-t border-border" />
      {terms.map((t) => <label key={t.key} className="flex cursor-pointer items-center gap-3 rounded-sm px-2 py-2 text-sm hover:bg-muted"><Checkbox checked={value.includes(t.key)} onCheckedChange={() => toggle(t.key)} />{t[lang]}</label>)}
    </PopoverContent>
  </Popover>;
}
