import { useState, type FormEvent } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { supabase } from "@/lib/backend/client";
import type { Lang } from "@/lib/artworks";

export function SubscribeForm({ lang }: { lang: Lang }) {
  const ru = lang === "ru";
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    setState("busy");
    const { error } = await supabase.rpc("subscribe", { _email: email, _lang: lang });
    setState(error ? "error" : "done");
  };
  return <form onSubmit={submit} className="max-w-md">
    <p className="text-xs uppercase tracking-wide opacity-60">{ru ? "Подписаться на обновления" : "Subscribe to updates"}</p>
    <p className="mt-2 text-xs leading-6 opacity-60">{ru ? "Новые работы и выставки — раз в месяц, без спама." : "New works and exhibitions — monthly, no spam."}</p>
    {state === "done" ? <p className="mt-4 flex items-center gap-2 text-sm"><Check className="size-4" />{ru ? "Вы подписаны. Управлять подпиской можно в личном кабинете." : "You're subscribed. Manage it in your account."}</p> :
    <div className="mt-4 flex items-center border-b border-footer-foreground/50">
      <input name="email" type="email" required maxLength={254} placeholder="email@example.com" aria-label="Email" className="min-w-0 flex-1 bg-transparent py-2 text-sm text-footer-foreground outline-none placeholder:text-footer-foreground/40" />
      <button type="submit" disabled={state === "busy"} aria-label={ru ? "Подписаться" : "Subscribe"} className="flex items-center gap-2 py-2 pl-3 text-sm">{state === "busy" ? <Loader2 className="size-4 animate-spin" /> : <>{ru ? "Подписаться" : "Subscribe"}<ArrowRight className="size-4" /></>}</button>
    </div>}
    {state === "error" && <p role="alert" className="mt-2 text-xs text-destructive">{ru ? "Не удалось подписаться. Проверьте адрес." : "Could not subscribe. Check the address."}</p>}
  </form>;
}
