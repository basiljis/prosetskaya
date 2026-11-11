import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { z } from "zod";
import { artist, type Lang } from "@/lib/artworks";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  contact: z.string().trim().min(3).max(150),
  message: z.string().trim().min(1).max(1500),
});

export function ContactDialog({ lang, children }: { lang: Lang; children: ReactNode }) {
  const en = lang === "en";
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const parsed = schema.safeParse({ name: f.get("name"), contact: f.get("contact"), message: f.get("message") });
    if (!parsed.success) { setError(en ? "Please fill in all fields." : "Пожалуйста, заполните все поля."); return; }
    if (!f.get("consent")) { setError(en ? "Please accept the privacy policy." : "Подтвердите согласие с политикой конфиденциальности."); return; }
    setError("");
    const { name, contact, message } = parsed.data;
    const body = `${message}\n\n${name}\n${contact}`;
    window.location.href = `mailto:${artist.email}?subject=${encodeURIComponent(en ? "Message from the website" : "Сообщение с сайта")}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };
  const field = "mt-2 w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground";
  return (
    <Dialog.Root open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setSent(false); setError(""); } }}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-foreground/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[81] w-[min(92vw,480px)] -translate-x-1/2 -translate-y-1/2 bg-background p-7 text-foreground shadow-2xl md:p-9">
          <Dialog.Close className="absolute right-4 top-4" aria-label={en ? "Close" : "Закрыть"}><X className="size-5" /></Dialog.Close>
          <Dialog.Title className="font-display text-3xl">{en ? "Write to Yulia" : "Написать Юлии"}</Dialog.Title>
          <Dialog.Description className="mt-2 text-xs text-muted-foreground">{en ? "Ask about a work, a commission or a collaboration." : "Вопрос о работе, заказ или сотрудничество — Юлия ответит лично."}</Dialog.Description>
          {sent ? (
            <p className="mt-8 text-sm leading-7">{en ? "Your mail app has opened with the message ready — just press Send." : "Открылась ваша почта с готовым письмом — осталось нажать «Отправить»."}</p>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-5" noValidate>
              <label className="block text-[10px] uppercase text-muted-foreground">{en ? "Name" : "Имя"}<input name="name" maxLength={100} className={field} /></label>
              <label className="block text-[10px] uppercase text-muted-foreground">{en ? "Email or phone" : "Почта или телефон"}<input name="contact" maxLength={150} className={field} /></label>
              <label className="block text-[10px] uppercase text-muted-foreground">{en ? "Message" : "Сообщение"}<textarea name="message" rows={4} maxLength={1500} className={field} /></label>
              <label className="flex items-start gap-2 text-[11px] text-muted-foreground"><input type="checkbox" name="consent" className="mt-0.5" />{en ? "I agree with the privacy policy" : "Согласен(на) с политикой конфиденциальности"}</label>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <button type="submit" className="w-full bg-foreground py-3 text-xs uppercase tracking-[0.2em] text-background">{en ? "Send" : "Отправить"}</button>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
