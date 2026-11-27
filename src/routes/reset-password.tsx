import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/backend/client";
import { SimplePage } from "@/components/simple-page";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Новый пароль — Юлия Просецкая" },
    { name: "description", content: "Установка нового пароля для личного кабинета покупателя." },
    { property: "og:title", content: "Новый пароль" },
    { property: "og:description", content: "Установка нового пароля." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password") ?? "");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setMsg("Ссылка устарела — запросите письмо ещё раз."); else navigate({ to: "/account" });
  };
  return (
    <SimplePage title="Новый пароль">
      <form onSubmit={submit} className="mt-10 max-w-sm space-y-5">
        <input name="password" type="password" required minLength={6} placeholder="Новый пароль" className="w-full border-b border-border bg-transparent py-2 text-sm outline-none" />
        {msg && <p className="text-xs">{msg}</p>}
        <button className="w-full bg-foreground py-3 text-xs uppercase tracking-[0.2em] text-background">Сохранить</button>
      </form>
    </SimplePage>
  );
}
