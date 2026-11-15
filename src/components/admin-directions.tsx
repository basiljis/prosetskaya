import { useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Direction } from "@/lib/directions";

export function AdminDirections({ initial, busy, onSave }: { initial: Direction[]; busy: boolean; onSave: (d: Direction[]) => void }) {
  const [list, setList] = useState(initial);
  const move = (i: number, by: number) => { const n = [...list]; const [x] = n.splice(i, 1); n.splice(i + by, 0, x!); setList(n); };
  const set = (i: number, patch: Partial<Direction>) => setList(list.map((d, j) => (j === i ? { ...d, ...patch } : d)));
  return <section className="mb-10 border-b border-border pb-8">
    <h2 className="font-display text-3xl">Направления</h2>
    <p className="mt-2 text-xs text-muted-foreground">Названия, порядок и показ фильтров в разделе «Все работы». Проекты показываются отдельным блоком.</p>
    <ul className="mt-5 border-t border-border">{list.map((d, i) => <li key={d.key} className={`grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2 border-b border-border py-2 ${d.hidden ? "opacity-50" : ""}`}>
      <span className="flex flex-col"><Button variant="editorial" size="icon" className="size-6" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Выше"><ArrowUp /></Button><Button variant="editorial" size="icon" className="size-6" disabled={i === list.length - 1} onClick={() => move(i, 1)} aria-label="Ниже"><ArrowDown /></Button></span>
      <Input value={d.ru} onChange={(e) => set(i, { ru: e.target.value })} aria-label="Название (рус.)" className="h-10 bg-card shadow-none" />
      <Input value={d.en} onChange={(e) => set(i, { en: e.target.value })} aria-label="Название (англ.)" className="h-10 bg-card shadow-none" />
      <Button variant="editorial" size="icon" disabled={d.key === "all"} onClick={() => set(i, { hidden: !d.hidden })} aria-label={d.hidden ? "Показать" : "Скрыть"} title={d.hidden ? "Показать" : "Скрыть"}>{d.hidden ? <EyeOff /> : <Eye />}</Button>
    </li>)}</ul>
    <Button disabled={busy} onClick={() => onSave(list)} className="mt-5 h-11">{busy ? <Loader2 className="animate-spin" /> : <Save />}Сохранить направления</Button>
  </section>;
}
