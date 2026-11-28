import { Ruler, SwatchBook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { COLOR_OPTIONS, type SizeRange } from "@/lib/designer-filters";
import type { Lang } from "@/lib/artworks";

export function DesignerFilters({ size, onSize, colors, onColors, lang }: { size: SizeRange; onSize: (s: SizeRange) => void; colors: string[]; onColors: (c: string[]) => void; lang: Lang }) {
  const ru = lang === "ru";
  return <>
    <Popover><PopoverTrigger asChild><Button variant={Object.values(size).some(Boolean) ? "default" : "outline"} className="h-9 shrink-0 rounded-full px-2.5 sm:px-3" aria-label={ru ? "Размеры картины" : "Artwork dimensions"} title={ru ? "Размеры картины" : "Artwork dimensions"}><Ruler className="size-4" /><span className="hidden text-xs lg:inline">{ru ? "Размер" : "Size"}</span></Button></PopoverTrigger><PopoverContent align="start" className="w-64">
      <p className="mb-3 text-xs font-medium">{ru ? "Размеры, см" : "Dimensions, cm"}</p><div className="grid grid-cols-2 gap-3">{([['minW', ru ? 'Ширина от' : 'Min width'], ['maxW', ru ? 'Ширина до' : 'Max width'], ['minH', ru ? 'Высота от' : 'Min height'], ['maxH', ru ? 'Высота до' : 'Max height']] as const).map(([key, label]) => <label key={key} className="text-xs text-muted-foreground">{label}<Input type="number" min="0" value={size[key]} onChange={(e) => onSize({ ...size, [key]: e.target.value })} className="mt-1 h-9" /></label>)}</div>
    </PopoverContent></Popover>
    <Popover><PopoverTrigger asChild><Button variant={colors.length ? "default" : "outline"} className="h-9 shrink-0 rounded-full px-2.5 sm:px-3" aria-label={ru ? "Цветовые решения" : "Color palettes"} title={ru ? "Цветовые решения" : "Color palettes"}><SwatchBook className="size-4" /><span className="hidden text-xs lg:inline">{ru ? "Цвет" : "Color"}</span></Button></PopoverTrigger><PopoverContent align="start" className="w-56 max-h-[min(400px,70dvh)] overflow-y-auto p-2">
      {COLOR_OPTIONS.map((c) => <label key={c.key} className="flex cursor-pointer items-center gap-3 px-2 py-2 text-sm hover:bg-muted"><Checkbox checked={colors.includes(c.key)} onCheckedChange={() => onColors(colors.includes(c.key) ? colors.filter((v) => v !== c.key) : [...colors, c.key])} /><span className={`size-4 rounded-full border border-border ${c.swatch}`} />{c[lang]}</label>)}
    </PopoverContent></Popover>
  </>;
}
