import { useState, type FormEvent } from "react";
import { Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Term } from "@/lib/genres";
import { uploadImage } from "@/lib/uploads";

export function AdminUpload({ genres, styles, onSaved }: { genres: Term[]; styles: Term[]; onSaved: (m: string) => void }) {
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const form = e.currentTarget; const f = new FormData(form); const file = f.get("file");
    if (!(file instanceof File) || !file.size) { setErr("Выберите изображение."); return; }
    setBusy(true); setErr("");
    try {
      const img = await uploadImage(file, "works");
      const g = String(f.get("genre") || "");
      const { error } = await supabase.from("artworks").insert({ id: `work-${Date.now()}`, title_ru: String(f.get("title_ru")), title_en: String(f.get("title_en") || ""), year: String(f.get("year") || ""), size: String(f.get("size") || ""), medium_ru: String(f.get("medium_ru") || ""), genre: g || null, style: String(f.get("style") || "") || null, category: g === "landscape" ? "landscape" : "painting", categories: [g === "landscape" ? "landscape" : "painting"], image_url: img.url, width: img.width, height: img.height, sort_order: -Math.floor(Date.now() / 1000) });
      if (error) throw new Error("Работа не сохранена.");
      form.reset(); onSaved("Новая работа добавлена в начало каталога");
    } catch (x) { setErr(x instanceof Error ? x.message : "Ошибка загрузки"); } finally { setBusy(false); }
  };
  const sel = "h-10 w-full border border-input bg-card px-2 text-sm";
  return <form onSubmit={submit} className="mb-8 grid gap-3 border border-border bg-card p-5 md:grid-cols-4">
    <h3 className="font-display text-2xl md:col-span-4">Добавить работу</h3>
    <Input name="file" type="file" accept="image/*" required className="md:col-span-4" />
    <Input name="title_ru" required placeholder="Название" /><Input name="title_en" placeholder="Название (англ.)" /><Input name="year" placeholder="Год" /><Input name="size" placeholder="Размер, напр. 60×80" />
    <Input name="medium_ru" placeholder="Техника, напр. Холст, масло" />
    <select name="genre" className={sel} defaultValue=""><option value="">Жанр</option>{genres.map((t) => <option key={t.key} value={t.key}>{t.ru}</option>)}</select>
    <select name="style" className={sel} defaultValue=""><option value="">Направление</option>{styles.map((t) => <option key={t.key} value={t.key}>{t.ru}</option>)}</select>
    <Button disabled={busy} className="h-10">{busy ? <Loader2 className="animate-spin" /> : <Upload />}Загрузить</Button>
    {err && <p role="alert" className="text-sm text-destructive md:col-span-4">{err}</p>}
  </form>;
}
