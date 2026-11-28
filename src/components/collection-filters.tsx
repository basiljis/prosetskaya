import type React from "react";
import { useState, type ReactNode } from "react";
import { Calendar, ChevronDown, Palette, Search, Shapes, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Lang } from "@/lib/artworks";
import { copy } from "@/lib/gallery-copy";
import type { CollectionMenuPosition } from "@/lib/collection-layout";
import type { Term } from "@/lib/genres";

type Props = { position: CollectionMenuPosition; lang: Lang; genreTerms: Term[]; styleTerms: Term[] | null; genre: string[]; style: string[]; onGenre: (v: string[]) => void; onStyle: (v: string[]) => void; query: string; onQuery: (q: string) => void; years?: string[]; selectedYears?: string[]; onYears?: (v: string[]) => void; extra?: React.ReactNode };

/** Collection filters: multi-select dropdowns for genre and style plus search. */
export function CollectionFilters({ position, lang, genreTerms, styleTerms, genre, style, onGenre, onStyle, query, onQuery, extra, years, selectedYears = [], onYears }: Props) {
  const t = copy[lang];
  const left = position === "left";
  const ru = lang === "ru";
  const ph = ru ? "Поиск по названию, году" : "Search title, year";
  const any = genre.length + style.length + selectedYears.length > 0;
  const [searching, setSearching] = useState(false);
  const s = searching || !!query;
  return <div className={`sticky top-[120px] z-20 self-start border-y border-border bg-background py-2.5 lg:py-4 ${left ? "lg:top-[132px] lg:border-y-0 lg:border-r lg:pr-6" : ""}`} role="group" aria-label={t.practices}>
    {left && <p className="mb-4 hidden text-xs font-medium lg:block">{t.collection}</p>}
    <div className={`flex flex-wrap items-center gap-2 ${left ? "lg:flex-col lg:items-stretch" : ""}`}>
      <Multi icon={<Shapes className="size-4" />} compact={s} onOpen={() => setSearching(false)} label={ru ? "Жанр" : "Genre"} all={ru ? "Все жанры" : "All genres"} terms={genreTerms} value={genre} onChange={onGenre} lang={lang} />
      {styleTerms && <Multi icon={<Palette className="size-4" />} compact={s} onOpen={() => setSearching(false)} label={ru ? "Направление" : "Style"} all={ru ? "Все направления" : "All styles"} terms={styleTerms} value={style} onChange={onStyle} lang={lang} />}
      {years && onYears && <Multi icon={<Calendar className="size-4" />} compact={s} onOpen={() => setSearching(false)} label={ru ? "Год" : "Year"} all={ru ? "Все годы" : "All years"} terms={years.map((y) => ({ key: y, ru: y, en: y, hidden: false }))} value={selectedYears} onChange={onYears} lang={lang} />}
      {extra}
      {any && <button type="button" onClick={() => { onGenre([]); onStyle([]); onYears?.([]); }} className="px-2 text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline">{ru ? "Сбросить" : "Reset"}</button>}
      <div className={`relative min-w-0 ${s ? "block w-full sm:flex-1" : "hidden"} ${left ? "lg:w-full" : ""}`}>
        <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input autoFocus={searching} value={query} onChange={(e) => onQuery(e.target.value)} placeholder={ph} aria-label={ph} className="h-9 rounded-full bg-transparent pl-9 pr-8 text-xs shadow-none" />
        {(query || searching) && <button type="button" onClick={() => { onQuery(""); setSearching(false); }} aria-label={ru ? "Очистить" : "Clear"} className="absolute right-3 top-2.5 text-muted-foreground"><X className="size-4" /></button>}
      </div>
      {!s && <Button variant="editorial" onClick={() => setSearching(true)} aria-label={ph} className="size-9 shrink-0 rounded-full border border-border p-0 text-muted-foreground "><Search className="size-4" /></Button>}
    </div>
  </div>;
}

function Multi({ icon, compact, onOpen, label, all, terms, value, onChange, lang }: { icon: ReactNode; compact: boolean; onOpen: () => void; label: string; all: string; terms: Term[]; value: string[]; onChange: (v: string[]) => void; lang: Lang }) {
  const active = value.length > 0;
  const names = terms.filter((t) => value.includes(t.key)).map((t) => t[lang]);
  const text = !active ? all : names.length === 1 ? names[0] : `${label} · ${names.length}`;
  const toggle = (k: string) => onChange(value.includes(k) ? value.filter((v) => v !== k) : [...value, k]);
  return <Popover onOpenChange={(o) => o && onOpen()}>
    <PopoverTrigger asChild>
      <Button variant="editorial" aria-label={label} title={text} className={`h-9 shrink-0 justify-between gap-2 rounded-full border text-xs px-2.5 ${compact ? "sm:w-9 sm:px-0" : "sm:px-3"} ${active ? "border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "border-border text-muted-foreground hover:border-primary hover:text-primary"}`}><span className="mx-auto">{icon}</span><span className={`max-w-36 truncate ${compact ? "hidden" : "hidden sm:inline"}`}>{text}</span><ChevronDown className={`size-3 shrink-0 ${compact ? "hidden" : "hidden sm:block"}`} /></Button>
    </PopoverTrigger>
    <PopoverContent align="start" className="z-[110] max-h-[min(420px,var(--radix-popover-content-available-height))] w-64 overflow-y-auto p-2">
      <button type="button" onClick={() => onChange([])} className={`w-full rounded-sm px-2 py-2 text-left text-sm ${!active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>{all}</button>
      <div className="my-1 border-t border-border" />
      {terms.map((t) => <label key={t.key} className="flex cursor-pointer items-center gap-3 rounded-sm px-2 py-2 text-sm hover:bg-muted"><Checkbox checked={value.includes(t.key)} onCheckedChange={() => toggle(t.key)} />{t[lang]}</label>)}
    </PopoverContent>
  </Popover>;
}
