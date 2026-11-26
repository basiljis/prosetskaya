import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, Mail, Plus, Trash2, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { buildNewsletterHtml } from "@/lib/newsletter";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { newsKind, type NewsItem } from "@/lib/news";
import { uploadImage } from "@/lib/uploads";

export function AdminNews({ onSaved }: { onSaved: (m: string) => void }) {
  const q = useQuery({ queryKey: ["admin-news"], queryFn: async () => { const { data, error } = await supabase.from("news").select("*").order("created_at", { ascending: false }); if (error) throw error; return data as NewsItem[]; } });
  const subs = useQuery({ queryKey: ["admin-subscribers"], queryFn: async () => { const { data, error } = await supabase.from("subscribers").select("email, subscribed, lang, created_at").order("created_at", { ascending: false }); if (error) throw error; return data; } });
  const [mail, setMail] = useState<NewsItem | null>(null); const [showSubs, setShowSubs] = useState(false);
  const active = (subs.data ?? []).filter((x) => x.subscribed);
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
  return <Tabs defaultValue="list"><TabsList className="mb-6"><TabsTrigger value="list">Новости</TabsTrigger><TabsTrigger value="new">Добавить новость</TabsTrigger><TabsTrigger value="subscribers">Подписчики</TabsTrigger></TabsList><TabsContent value="subscribers">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-border bg-card p-4">
      <p className="flex items-center gap-2 text-sm"><Users className="size-4 text-primary" />Подписчиков: <b>{active.length}</b>{(subs.data?.length ?? 0) > active.length && <span className="text-xs text-muted-foreground">(отписались: {(subs.data?.length ?? 0) - active.length})</span>}</p>
      <Button variant="outline" size="sm" onClick={() => setShowSubs(!showSubs)}>{showSubs ? "Скрыть список" : "Показать список"}</Button>
      {showSubs && <ul className="max-h-64 w-full overflow-auto border-t border-border pt-2 text-xs">{(subs.data ?? []).map((x) => <li key={x.email} className={`flex justify-between py-1 ${x.subscribed ? "" : "text-muted-foreground line-through"}`}><span>{x.email}</span><span>{new Date(x.created_at).toLocaleDateString("ru-RU")}</span></li>)}</ul>}
    </div>
    </TabsContent><TabsContent value="new"><form onSubmit={submit} className="grid gap-3 border border-border bg-card p-5 md:grid-cols-2">
      <h2 className="font-display text-3xl md:col-span-2">Новая новость</h2>
      <select name="kind" defaultValue="work" className="h-10 border border-input bg-card px-2 text-sm">{Object.entries(newsKind).map(([k, v]) => <option key={k} value={k}>{v.ru}</option>)}</select>
      <Input name="event_date" placeholder="Дата, напр. 12–30 декабря 2026" />
      <Input name="title_ru" required placeholder="Заголовок" /><Input name="title_en" placeholder="Заголовок (англ.)" />
      <Textarea name="body_ru" rows={5} placeholder="Текст" /><Textarea name="body_en" rows={5} placeholder="Текст (англ.)" />
      <Input name="file" type="file" accept="image/*" />
      <Button disabled={busy} className="h-10">{busy ? <Loader2 className="animate-spin" /> : <Plus />}Опубликовать</Button>
      {err && <p role="alert" className="text-sm text-destructive md:col-span-2">{err}</p>}
    </form>
    </TabsContent><TabsContent value="list"><ul className="mt-8 border-t border-border">{(q.data ?? []).map((n) => <li key={n.id} className={`flex items-center gap-4 border-b border-border py-3 ${n.published ? "" : "opacity-50"}`}>
      {n.image_url ? <img src={n.image_url} alt="" className="size-12 object-cover" /> : <span className="size-12 bg-muted" />}
      <div className="min-w-0 flex-1"><p className="truncate text-sm">{n.title_ru}</p><p className="text-xs text-muted-foreground">{newsKind[n.kind].ru} · {new Date(n.created_at).toLocaleDateString("ru-RU")}</p></div>
      <Button variant="ghost" size="icon" onClick={() => setMail(n)} aria-label="Рассылка" title="Рассылка"><Mail /></Button>
      <Button variant="ghost" size="icon" onClick={() => toggle(n)} aria-label={n.published ? "Скрыть" : "Показать"}>{n.published ? <Eye /> : <EyeOff />}</Button>
      <Button variant="ghost" size="icon" onClick={() => remove(n)} aria-label="Удалить"><Trash2 /></Button>
    </li>)}</ul>
    </TabsContent><Dialog open={!!mail} onOpenChange={(o) => !o && setMail(null)}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-auto">
        <DialogHeader><DialogTitle>Рассылка: {mail?.title_ru}</DialogTitle></DialogHeader>
        {mail && <iframe title="Предпросмотр письма" srcDoc={buildNewsletterHtml(mail, "ru", window.location.origin)} className="h-[60vh] w-full border border-border bg-background" />}
        <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted-foreground">Получателей: {active.length}. Отправка заработает после подключения почтового домена.</p><Button disabled title="Нужен почтовый домен"><Mail />Отправить подписчикам</Button></div>
      </DialogContent>
    </Dialog>
    {q.data?.length === 0 && <p className="mt-6 text-sm text-muted-foreground">Новостей пока нет.</p>}
  </Tabs>;
}
