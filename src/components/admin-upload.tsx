import { useRef, useState, type FormEvent } from "react";
import { Loader2, Plus, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Term } from "@/lib/genres";
import { uploadImage } from "@/lib/uploads";

export function AdminUpload({ genres, styles, onSaved }: { genres: Term[]; styles: Term[]; onSaved: (m: string) => void }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const close = () => { setOpen(false); setDirty(false); setErr(""); };
  const requestClose = () => { if (busy) return; if (dirty) setConfirm(true); else close(); };

  const save = async () => {
    const form = formRef.current; if (!form) return false;
    if (!form.reportValidity()) return false;
    const f = new FormData(form); const file = f.get("file");
    if (!(file instanceof File) || !file.size) { setErr("Выберите изображение."); return false; }
    setBusy(true); setErr("");
    try {
      const img = await uploadImage(file, "works");
      const g = String(f.get("genre") || "");
      const { error } = await supabase.from("artworks").insert({ id: `work-${Date.now()}`, title_ru: String(f.get("title_ru")), title_en: String(f.get("title_en") || ""), year: String(f.get("year") || ""), size: String(f.get("size") || ""), medium_ru: String(f.get("medium_ru") || ""), genre: g || null, style: String(f.get("style") || "") || null, category: g === "landscape" ? "landscape" : "painting", categories: [g === "landscape" ? "landscape" : "painting"], image_url: img.url, width: img.width, height: img.height, sort_order: -Math.floor(Date.now() / 1000) });
      if (error) throw new Error("Работа не сохранена.");
      close(); onSaved("Новая работа добавлена в начало каталога");
      return true;
    } catch (x) { setErr(x instanceof Error ? x.message : "Ошибка загрузки"); return false; } finally { setBusy(false); }
  };
  const submit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); void save(); };
  const sel = "h-10 w-full border border-input bg-card px-2 text-sm";
  return <>
    <Button onClick={() => setOpen(true)} className="h-11"><Plus />Добавить работу</Button>
    <Dialog open={open} onOpenChange={(v) => { if (v) setOpen(true); else requestClose(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle className="font-display text-2xl">Добавить работу</DialogTitle><DialogDescription>Заполните данные и загрузите фото — оно будет автоматически сжато.</DialogDescription></DialogHeader>
        <form ref={formRef} onSubmit={submit} onChange={() => setDirty(true)} className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-xs sm:col-span-2">Изображение *<Input name="file" type="file" accept="image/*" required /></label>
          <label className="grid gap-1 text-xs">Название *<Input name="title_ru" required /></label>
          <label className="grid gap-1 text-xs">Название (англ.)<Input name="title_en" /></label>
          <label className="grid gap-1 text-xs">Год<Input name="year" /></label>
          <label className="grid gap-1 text-xs">Размер<Input name="size" placeholder="60×80" /></label>
          <label className="grid gap-1 text-xs sm:col-span-2">Техника<Input name="medium_ru" placeholder="Холст, масло" /></label>
          <label className="grid gap-1 text-xs">Жанр<select name="genre" className={sel} defaultValue=""><option value="">—</option>{genres.map((t) => <option key={t.key} value={t.key}>{t.ru}</option>)}</select></label>
          <label className="grid gap-1 text-xs">Направление<select name="style" className={sel} defaultValue=""><option value="">—</option>{styles.map((t) => <option key={t.key} value={t.key}>{t.ru}</option>)}</select></label>
          {err && <p role="alert" className="text-sm text-destructive sm:col-span-2">{err}</p>}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="outline" disabled={busy} onClick={requestClose}>Отмена</Button>
            <Button type="submit" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <Upload />}Сохранить</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    <AlertDialog open={confirm} onOpenChange={setConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Сохранить изменения?</AlertDialogTitle><AlertDialogDescription>Вы внесли данные о новой работе. Сохранить её перед закрытием?</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Продолжить редактирование</AlertDialogCancel>
          <Button variant="outline" onClick={() => { setConfirm(false); close(); }}>Не сохранять</Button>
          <AlertDialogAction onClick={() => { setConfirm(false); void save(); }}>Сохранить</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>;
}
