import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveAdminPrice } from "@/lib/admin";
import type { Artwork } from "@/lib/artworks";

export function AdminPriceEditor({ work, price, onSaved }: { work: Artwork; price: number | null; onSaved: () => void }) {
  const [value, setValue] = useState(price?.toString() ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { setValue(price?.toString() ?? ""); }, [price]);
  const changed = value !== (price?.toString() ?? "");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      await saveAdminPrice(work.id, value.trim() === "" ? null : Math.round(Number(value)));
      onSaved();
    } catch (err) { setError(err instanceof Error ? err.message : "Не удалось сохранить цену."); }
    finally { setBusy(false); }
  };
  return <li className="border-b border-border py-5">
    <div className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-4 sm:grid-cols-[72px_minmax(0,1fr)_180px]">
      <img src={work.image} alt={work.ru} loading="lazy" className="h-20 w-full bg-muted/40 object-contain" />
      <div className="min-w-0"><p className="text-sm font-medium">{work.ru}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{work.year} · {work.size}</p></div>
      <form onSubmit={submit} className="col-span-2 flex items-center gap-2 sm:col-span-1">
        <div className="relative flex-1"><Input type="number" inputMode="numeric" min={0} max={2147483647} step="1" value={value} onChange={(e) => setValue(e.target.value)} disabled={busy} aria-label={`Цена: ${work.ru}`} placeholder="По запросу" className="h-11 bg-card pr-7 shadow-none" /><span className="pointer-events-none absolute right-3 top-3 text-sm text-muted-foreground">₽</span></div>
        <Button type="submit" variant="outline" size="icon" className="size-11 shrink-0" disabled={busy || !changed} aria-label={`Сохранить цену: ${work.ru}`} title="Сохранить цену">{busy ? <Loader2 className="animate-spin" /> : <Save />}</Button>
      </form>
    </div>
    {error && <p role="alert" className="mt-3 text-xs leading-5 text-destructive">{error}</p>}
  </li>;
}