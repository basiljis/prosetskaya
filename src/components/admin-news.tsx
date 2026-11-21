import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { newsKind, type NewsItem } from "@/lib/news";
import { uploadImage } from "@/lib/uploads";

export function AdminNews({ onSaved }: { onSaved: (m: string) => void }) {
  const q = useQuery({ queryKey: ["admin-news"], queryFn: async () => { const { data, error } = await supabase.from("news").select("*").order("created_at", { ascending: false }); if (error) throw error; return data as NewsItem[]; } });
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const done = (m: string) => { void q.refetch(); onSaved(m); };
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const form = e.currentTarget; const f = new FormData(form); setBusy(true); setErr("");
    try {
      const file = f.get("file"); const image_url = file instanceof File && file.size ? (await uploadImage(file, "news")).url : "";
      const { error } = await supabase.from("news").insert({ kind: String(f.get("kind")), title_ru: String(f.get("title_ru")), title_en: String(f.get("title_en") || ""), body_ru: String(f.get("body_ru") || ""), body_en: String(f.get("body_en") || ""), event_date: String(f.get("event_date") || ""), image_url });
      if (error) throw new Error("Новость не сохранена.");
      form.reset(); done("Новость опубликована");
    } catch (x) { setErr(x instanceof Error ? x.message : "Ошибка"); } finally { setBusy(false); }
  };
  const toggle = async (n: NewsItem) => { const { error } = await supabase.from("news").update({ published: !n.published }).eq("id", n.id); if (error) setErr("Не удалось изменить."); else done(n.published ? "Новость скрыта" : "Новость опубликована"); };
  const remove = async (n: NewsItem) => { if (!confirm(`Удалить «${n.title_ru}»?`)) return; const { error } = await supabase.from("news").delete().eq("id", n.id); if (error) setErr("Не удалось удалить."); else done("Новость удалена"); };
  return <div>
    <form onSubmit={submit} className="grid gap-3 border border-border bg-card p-5 md:grid-cols-2">
      <h2 className="font-display text-3xl md:col-span-2">Новая новость</h2>
      <select name="kind" defaultValue="work" className="h-10 border border-input bg-card px-2 text-sm">{Object.entries(newsKind).map(([k, v]) => <option key={k} value={k}>{v.ru}</option>)}</select>
      <Input name="event_date" placeholder="Дата, напр. 12–30 декабря 2026" />
      <Input name="title_ru" required placeholder="Заголовок" /><Input name="title_en" placeholder="Заголовок (англ.)" />
      <Textarea name="body_ru" rows={5} placeholder="Текст" /><Textarea name="body_en" rows={5} placeholder="Текст (англ.)" />
      <Input name="file" type="file" accept="image/*" />
      <Button disabled={busy} className="h-10">{busy ? <Loader2 className="animate-spin" /> : <Plus />}Опубликовать</Button>
      {err && <p role="alert" className="text-sm text-destructive md:col-span-2">{err}</p>}
    </form>
    <ul className="mt-8 border-t border-border">{(q.data ?? []).map((n) => <li key={n.id} className={`flex items-center gap-4 border-b border-border py-3 ${n.published ? "" : "opacity-50"}`}>
      {n.image_url ? <img src={n.image_url} alt="" className="size-12 object-cover" /> : <span className="size-12 bg-muted" />}
      <div className="min-w-0 flex-1"><p className="truncate text-sm">{n.title_ru}</p><p className="text-xs text-muted-foreground">{newsKind[n.kind].ru} · {new Date(n.created_at).toLocaleDateString("ru-RU")}</p></div>
      <Button variant="ghost" size="icon" onClick={() => toggle(n)} aria-label={n.published ? "Скрыть" : "Показать"}>{n.published ? <Eye /> : <EyeOff />}</Button>
      <Button variant="ghost" size="icon" onClick={() => remove(n)} aria-label="Удалить"><Trash2 /></Button>
    </li>)}</ul>
    {q.data?.length === 0 && <p className="mt-6 text-sm text-muted-foreground">Новостей пока нет.</p>}
  </div>;
}
