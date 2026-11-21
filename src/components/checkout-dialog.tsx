import * as Dialog from "@radix-ui/react-dialog";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createOrder } from "@/lib/shop.functions";
import { rub } from "@/lib/shop";
import type { Artwork } from "@/lib/artworks";

export function CheckoutDialog({ work, price, online, onClose }: { work: Artwork; price: number | null; online: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const submitOrder = useServerFn(createOrder);
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  const [method, setMethod] = useState<"invoice" | "online">("invoice");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [en, setEn] = useState(false);
  useEffect(() => setEn(localStorage.getItem("prosetskaya-lang") === "en"), []);
  const canOnline = online && !!price;
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null)); }, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true); setError("");
    try {
      const res = await submitOrder({ data: {
        artworkId: work.id, artworkTitle: work.ru, method,
        name: String(f.get("name") ?? ""), phone: String(f.get("phone") ?? ""), email: String(f.get("email") ?? ""),
        company: String(f.get("company") ?? ""), comment: String(f.get("comment") ?? ""),
        returnUrl: `${window.location.origin}/account`,
      } });
      if (!res.ok) { setError(res.error); return; }
      qc.invalidateQueries({ queryKey: ["shop"] });
      if ("paymentUrl" in res && res.paymentUrl) { window.location.assign(res.paymentUrl); return; }
      setDone(true);
    } catch { setError((en ? "Please check that all fields are filled in correctly." : "Проверьте, что все поля заполнены верно.")); }
    finally { setBusy(false); }
  };
  const field = "mt-2 w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground";
  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-foreground/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[81] max-h-[92vh] w-[min(94vw,520px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto bg-background p-7 text-foreground shadow-2xl md:p-9">
          <Dialog.Close className="absolute right-4 top-4" aria-label={en ? "Close" : "Закрыть"}><X className="size-5" /></Dialog.Close>
          <div className="flex gap-4"><img src={work.image} alt="" className="size-20 object-cover" /><div><Dialog.Title className="font-display text-3xl">{en ? work.en : work.ru}</Dialog.Title><Dialog.Description className="mt-1 text-xs text-muted-foreground">{en ? work.mediumEn : work.mediumRu}, {work.size} {en ? "cm" : "см"} · {price ? rub(price) : (en ? "price on request" : "цена по запросу")}</Dialog.Description></div></div>
          {email === undefined ? null : email === null ? (
            <div className="mt-8 text-sm leading-7"><p>{en ? "To purchase and track your order, sign in to your account." : "Чтобы оформить покупку и следить за заказом, войдите в личный кабинет."}</p>
              <Link to="/auth" onClick={() => sessionStorage.setItem("after-login", "/#works")} className="mt-5 block bg-foreground py-3 text-center text-xs uppercase tracking-[0.2em] text-background">{en ? "Sign in or register" : "Войти или зарегистрироваться"}</Link></div>
          ) : done ? (
            <div className="mt-8 text-sm leading-7"><p>{en ? "Order placed. Yulia will contact you and send a contract and invoice." : "Заказ оформлен. Юлия свяжется с вами, пришлёт договор и счёт."}</p><Link to="/account" className="mt-5 inline-block border-b border-foreground text-xs">{en ? "Open my orders" : "Открыть мои заказы"}</Link></div>
          ) : (
            <form onSubmit={submit} className="mt-7 space-y-5">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button type="button" onClick={() => setMethod("invoice")} className={`border p-3 text-left ${method === "invoice" ? "border-foreground" : "border-border text-muted-foreground"}`}><b className="block">{en ? "Contract and invoice" : "По договору и счёту"}</b>{en ? "Yulia will send the documents" : "Юлия пришлёт документы"}</button>
                <button type="button" disabled={!canOnline} onClick={() => setMethod("online")} className={`border p-3 text-left disabled:opacity-40 ${method === "online" ? "border-foreground" : "border-border text-muted-foreground"}`}><b className="block">{en ? "Pay online" : "Онлайн на сайте"}</b>{canOnline ? (en ? "Card or SBP, YooKassa" : "Карта или СБП, ЮKassa") : (en ? "Coming soon" : "Скоро будет доступно")}</button>
              </div>
              <label className="block text-[10px] uppercase text-muted-foreground">{en ? "Name" : "Имя"}<input name="name" required maxLength={100} className={field} /></label>
              <div className="grid grid-cols-2 gap-4"><label className="block text-[10px] uppercase text-muted-foreground">{en ? "Phone" : "Телефон"}<input name="phone" required maxLength={30} className={field} /></label><label className="block text-[10px] uppercase text-muted-foreground">{en ? "Email" : "Почта"}<input name="email" type="email" required defaultValue={email} maxLength={255} className={field} /></label></div>
              {method === "invoice" && <label className="block text-[10px] uppercase text-muted-foreground">{en ? "Company (for a business invoice)" : "Компания (если счёт на юрлицо)"}<input name="company" maxLength={200} className={field} /></label>}
              <label className="block text-[10px] uppercase text-muted-foreground">{en ? "Comment, delivery address" : "Комментарий, адрес доставки"}<textarea name="comment" rows={2} maxLength={1000} className={field} /></label>
              <label className="flex items-start gap-2 text-[11px] text-muted-foreground"><input type="checkbox" required className="mt-0.5" />{en ? "I agree to the " : "Согласен(на) с "}<Link to="/privacy" target="_blank" className="underline">{en ? "privacy policy" : "политикой конфиденциальности"}</Link> {en ? "and" : "и"} <Link to="/terms" target="_blank" className="underline">{en ? "terms" : "соглашением"}</Link></label>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <button disabled={busy} className="w-full bg-foreground py-3 text-xs uppercase tracking-[0.2em] text-background disabled:opacity-50">{method === "online" ? `${en ? "Pay" : "Оплатить"} ${rub(price)}` : (en ? "Place order" : "Оформить заказ")}</button>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
