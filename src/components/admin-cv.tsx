import { useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Cv } from "@/lib/cv";

export function AdminCv({ initial, busy, onSave }: { initial: Cv; busy: boolean; onSave: (cv: Cv) => void }) {
  const [cv, setCv] = useState(initial);
  const set = (patch: Partial<Cv>) => setCv({ ...cv, ...patch });
  const setSec = (i: number, patch: Partial<Cv["sections"][number]>) => set({ sections: cv.sections.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
  const L = "grid gap-1 text-xs text-muted-foreground";
  return <div className="space-y-6">
    <h2 className="font-display text-3xl">Резюме художницы</h2>
    <p className="text-xs text-muted-foreground">Изменения сразу видны на странице резюме. PDF-файл для скачивания обновляется отдельно.</p>
    <div className="grid gap-4 md:grid-cols-2">
      <label className={L}>Вступление<Textarea rows={4} value={cv.lead} onChange={(e) => set({ lead: e.target.value })} className="bg-card text-foreground" /></label>
      <label className={L}>Вступление (англ.)<Textarea rows={4} value={cv.leadEn} onChange={(e) => set({ leadEn: e.target.value })} className="bg-card text-foreground" /></label>
      <label className={L}>Факты<Textarea rows={2} value={cv.facts} onChange={(e) => set({ facts: e.target.value })} className="bg-card text-foreground" /></label>
      <label className={L}>Факты (англ.)<Textarea rows={2} value={cv.factsEn} onChange={(e) => set({ factsEn: e.target.value })} className="bg-card text-foreground" /></label>
    </div>
    {cv.sections.map((s, i) => <section key={i} className="border border-border bg-card p-4">
      <div className="flex gap-2"><Input value={s.ru} onChange={(e) => setSec(i, { ru: e.target.value })} aria-label="Раздел" /><Input value={s.en} onChange={(e) => setSec(i, { en: e.target.value })} aria-label="Раздел (англ.)" /><Button variant="ghost" size="icon" aria-label="Удалить раздел" onClick={() => set({ sections: cv.sections.filter((_, j) => j !== i) })}><Trash2 /></Button></div>
      <label className={`${L} mt-3`}>Пункты — каждый с новой строки<Textarea rows={Math.min(14, s.items.length + 2)} value={s.items.join("\n")} onChange={(e) => setSec(i, { items: e.target.value.split("\n") })} className="bg-background text-foreground" /></label>
    </section>)}
    <div className="flex gap-3"><Button variant="outline" onClick={() => set({ sections: [...cv.sections, { ru: "Новый раздел", en: "New section", items: [] }] })}><Plus />Раздел</Button>
      <Button disabled={busy} onClick={() => onSave({ ...cv, sections: cv.sections.map((s) => ({ ...s, items: s.items.map((x) => x.trim()).filter(Boolean) })) })}>{busy ? <Loader2 className="animate-spin" /> : <Save />}Сохранить резюме</Button></div>
  </div>;
}
