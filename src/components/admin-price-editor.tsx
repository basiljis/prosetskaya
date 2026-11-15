import { useEffect, useState, type FormEvent } from "react";
import { ChevronDown, Eye, EyeOff, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveAdminArtwork, saveAdminPrice } from "@/lib/admin";
import type { ArtworkRow } from "@/lib/artwork-rows";
import { categories } from "@/lib/artworks";
import { copy } from "@/lib/gallery-copy";

const fields = [["title_ru", "Название (RU)"], ["title_en", "Название (EN)"], ["year", "Год"], ["size", "Размер, см"], ["medium_ru", "Техника (RU)"], ["medium_en", "Техника (EN)"]] as const;

export function AdminPriceEditor({ work, price, onSaved }: { work: ArtworkRow; price: number | null; onSaved: (message: string) => void }) {
  const [value, setValue] = useState(price?.toString() ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  useEffect(() => { setValue(price?.toString() ?? ""); }, [price]);
  const changed = value !== (price?.toString() ?? "");
  const act = async (fn: () => Promise<void>, message: string) => {
    setBusy(true); setError("");
    try { await fn(); onSaved(message); } catch (err) { setError(err instanceof Error ? err.message : "Не удалось сохранить."); } finally { setBusy(false); }
  };
  const submitPrice = (event: FormEvent) => { event.preventDefault(); void act(() => saveAdminPrice(work.id, value.trim() === "" ? null : Math.round(Number(value))), "Цена сохранена"); };
  const submitInfo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim().slice(0, 300);
    const availability = get("source_availability");
    void act(() => saveAdminArtwork(work.id, { title_ru: get("title_ru") || work.title_ru, title_en: get("title_en"), year: get("year"), size: get("size"), medium_ru: get("medium_ru"), medium_en: get("medium_en"), category: get("category") || work.category, source_availability: availability || null, sort_order: Number(get("sort_order")) || 0 }), "Картина сохранена");
  };
  return <li className={`border-b border-border py-5 ${work.hidden ? "opacity-60" : ""}`}>
    <div className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-4 sm:grid-cols-[72px_minmax(0,1fr)_180px_auto]">
      <img src={work.image_url} alt={work.title_ru} loading="lazy" className="h-20 w-full bg-muted/40 object-contain" />
      <div className="min-w-0"><p className="text-sm font-medium">{work.title_ru}{work.hidden && <span className="ml-2 text-xs text-muted-foreground">· скрыта</span>}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{copy.ru.categories[work.category as keyof typeof copy.ru.categories] ?? work.category} · {work.year} · {work.size}</p></div>
      <form onSubmit={submitPrice} className="col-span-2 flex items-center gap-2 sm:col-span-1">
        <div className="relative flex-1"><Input type="number" inputMode="numeric" min={0} max={2147483647} step="1" value={value} onChange={(e) => setValue(e.target.value)} disabled={busy} aria-label={`Цена: ${work.title_ru}`} placeholder="По запросу" className="h-11 bg-card pr-7 shadow-none" /><span className="pointer-events-none absolute right-3 top-3 text-sm text-muted-foreground">₽</span></div>
        <Button type="submit" variant="outline" size="icon" className="size-11 shrink-0" disabled={busy || !changed} aria-label={`Сохранить цену: ${work.title_ru}`} title="Сохранить цену">{busy ? <Loader2 className="animate-spin" /> : <Save />}</Button>
      </form>
      <div className="col-span-2 flex gap-2 sm:col-span-1">
        <Button type="button" variant="outline" size="icon" className="size-11" disabled={busy} onClick={() => act(() => saveAdminArtwork(work.id, { hidden: !work.hidden }), work.hidden ? "Картина снова на сайте" : "Картина скрыта")} aria-label={work.hidden ? "Показать на сайте" : "Скрыть с сайта"} title={work.hidden ? "Показать на сайте" : "Скрыть с сайта"}>{work.hidden ? <EyeOff /> : <Eye />}</Button>
        <Button type="button" variant="outline" className="h-11" onClick={() => setOpen(!open)} aria-expanded={open}>Изменить<ChevronDown className={open ? "rotate-180" : ""} /></Button>
      </div>
    </div>
    {open && <form onSubmit={submitInfo} className="mt-5 grid gap-3 bg-muted/40 p-4 sm:grid-cols-2">
      {fields.map(([k, label]) => <label key={k} className="text-xs text-muted-foreground">{label}<Input name={k} defaultValue={work[k]} disabled={busy} className="mt-1 h-10 bg-card text-foreground shadow-none" /></label>)}
      <label className="text-xs text-muted-foreground">Коллекция<select name="category" defaultValue={work.category} className="mt-1 h-10 w-full border border-input bg-card px-2 text-sm text-foreground">{categories.filter((c) => c !== "all").map((c) => <option key={c} value={c}>{copy.ru.categories[c]}</option>)}</select></label>
      <label className="text-xs text-muted-foreground">Статус<select name="source_availability" defaultValue={work.source_availability ?? ""} className="mt-1 h-10 w-full border border-input bg-card px-2 text-sm text-foreground"><option value="">В продаже</option><option value="sold">Продана</option><option value="private">В частной коллекции</option><option value="museum">В музее</option></select></label>
      <label className="text-xs text-muted-foreground">Порядок показа<Input name="sort_order" type="number" defaultValue={work.sort_order} disabled={busy} className="mt-1 h-10 bg-card text-foreground shadow-none" /></label>
      <div className="flex items-end"><Button type="submit" disabled={busy} className="h-10">{busy ? <Loader2 className="animate-spin" /> : <Save />}Сохранить</Button></div>
    </form>}
    {error && <p role="alert" className="mt-3 text-xs leading-5 text-destructive">{error}</p>}
  </li>;
}
