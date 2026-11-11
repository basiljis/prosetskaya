import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SimplePage } from "@/components/simple-page";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Вход в личный кабинет — Юлия Просецкая" },
    { name: "description", content: "Вход и регистрация покупателя: ваши заказы картин Юлии Просецкой." },
    { property: "og:title", content: "Личный кабинет покупателя" },
    { property: "og:description", content: "Вход и регистрация покупателя." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AuthPage,
});

const field = "mt-2 w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up" | "reset">("in");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "").trim();
    const password = String(f.get("password") ?? "");
    setBusy(true); setMsg("");
    if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
      setMsg(error ? "Не удалось отправить письмо." : "Письмо для смены пароля отправлено.");
    } else if (mode === "up") {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/account` } });
      setMsg(error ? error.message : "Проверьте почту и подтвердите регистрацию по ссылке из письма.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg("Неверная почта или пароль.");
      else { const back = sessionStorage.getItem("after-login"); sessionStorage.removeItem("after-login"); if (back?.startsWith("/") && !back.startsWith("//")) window.location.assign(back); else navigate({ to: "/account" }); }
    }
    setBusy(false);
  };
  return (
    <SimplePage title={mode === "up" ? "Регистрация" : mode === "reset" ? "Восстановление пароля" : "Вход"} kicker="Личный кабинет покупателя">
      <form onSubmit={submit} className="mt-10 max-w-sm space-y-5">
        <label className="block text-[10px] uppercase text-muted-foreground">Почта<input name="email" type="email" required maxLength={255} className={field} /></label>
        {mode !== "reset" && <label className="block text-[10px] uppercase text-muted-foreground">Пароль<input name="password" type="password" required minLength={6} className={field} /></label>}
        {msg && <p className="text-xs">{msg}</p>}
        <button disabled={busy} className="w-full bg-foreground py-3 text-xs uppercase tracking-[0.2em] text-background disabled:opacity-50">{mode === "up" ? "Зарегистрироваться" : mode === "reset" ? "Отправить письмо" : "Войти"}</button>
        <div className="flex justify-between text-xs text-muted-foreground">
          <button type="button" onClick={() => { setMode(mode === "up" ? "in" : "up"); setMsg(""); }}>{mode === "up" ? "Уже есть аккаунт? Войти" : "Создать аккаунт"}</button>
          {mode === "in" && <button type="button" onClick={() => { setMode("reset"); setMsg(""); }}>Забыли пароль?</button>}
        </div>
      </form>
    </SimplePage>
  );
}
