import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/backend/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { artworks } from "@/lib/artworks";
import { ArtworkCaption } from "@/components/artwork-caption";

const featured = artworks.find((work) => work.id === "reflection");

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Вход в личный кабинет — Юлия Просецкая" },
    { name: "description", content: "Вход и регистрация покупателя: ваши заказы картин Юлии Просецкой." },
    { property: "og:title", content: "Личный кабинет покупателя" },
    { property: "og:description", content: "Вход и регистрация покупателя." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    ...(featured?.image.startsWith("https://") ? [
      { property: "og:image", content: featured.image },
      { name: "twitter:image", content: featured.image },
    ] : []),
  ] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up" | "reset">("in");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", localStorage.getItem("prosetskaya-theme") === "dark");
  }, []);
  const changeMode = (next: "in" | "up" | "reset") => {
    setMode(next);
    setMsg("");
    setShowPassword(false);
  };
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
  const confirmation = msg === "Проверьте почту и подтвердите регистрацию по ссылке из письма." || msg === "Письмо для смены пароля отправлено.";
  return (
    <main className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="gallery-shell flex min-h-20 flex-wrap items-center justify-between gap-4 py-4">
          <Button asChild variant="editorial" className="h-11 px-0 text-xs"><Link to="/"><ArrowLeft />В галерею</Link></Button>
          <Link to="/" className="text-sm font-medium sm:text-base">Юлия Просецкая<span className="text-primary">.</span></Link>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-[1160px] flex-1 content-start gap-14 px-5 py-10 md:px-10 md:py-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20 lg:py-20">
        <div className="mx-auto w-full max-w-[420px] lg:mx-0">
          <p className="text-[11px] uppercase text-muted-foreground">Личный кабинет</p>
          {mode !== "reset" ? (
            <div className="mt-7 grid grid-cols-2 border-b border-border" role="tablist" aria-label="Вход или регистрация">
              <Button type="button" role="tab" id="sign-in-tab" aria-controls="auth-panel" aria-selected={mode === "in"} variant="editorial" disabled={busy} onClick={() => changeMode("in")} className={`h-12 border-b-2 text-sm ${mode === "in" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>Вход</Button>
              <Button type="button" role="tab" id="sign-up-tab" aria-controls="auth-panel" aria-selected={mode === "up"} variant="editorial" disabled={busy} onClick={() => changeMode("up")} className={`h-12 border-b-2 text-sm ${mode === "up" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>Регистрация</Button>
            </div>
          ) : <Button variant="editorial" className="mt-6 h-11 px-0 text-xs" onClick={() => changeMode("in")} disabled={busy}><ArrowLeft />Вернуться ко входу</Button>}

          <div id="auth-panel" role={mode === "reset" ? undefined : "tabpanel"} aria-labelledby={mode === "reset" ? undefined : mode === "in" ? "sign-in-tab" : "sign-up-tab"}>
            <h1 className="mt-8 font-display text-4xl leading-tight sm:text-5xl">{mode === "up" ? "Регистрация" : mode === "reset" ? "Забыли пароль?" : "Вход в кабинет"}</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{mode === "up" ? "Начало вашей коллекции." : mode === "reset" ? "Отправим ссылку для восстановления на вашу почту." : "Рады видеть вас снова."}</p>

            {confirmation ? (
              <div className="mt-9 border-y border-border py-7" role="status" aria-live="polite">
                <CheckCircle2 className="size-7 text-primary" />
                <h2 className="mt-4 font-display text-3xl">Проверьте почту</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{msg}</p>
                <Button variant="outline" className="mt-6 h-11" onClick={() => changeMode("in")}>Вернуться ко входу<ArrowRight /></Button>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-8 space-y-6" aria-busy={busy}>
                <div>
                  <label htmlFor="auth-email" className="block text-xs font-medium">Электронная почта</label>
                  <div className="relative mt-2">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="auth-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={255} disabled={busy} className="h-12 rounded-sm bg-card pl-11 shadow-none" aria-describedby={msg ? "auth-error" : undefined} />
                  </div>
                </div>
                {mode !== "reset" && (
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <label htmlFor="auth-password" className="text-xs font-medium">Пароль</label>
                      {mode === "in" && <Button type="button" variant="editorial" disabled={busy} onClick={() => changeMode("reset")} className="h-8 px-0 text-xs text-muted-foreground">Забыли пароль?</Button>}
                    </div>
                    <div className="relative mt-2">
                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="auth-password" name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "up" ? "new-password" : "current-password"} placeholder={mode === "up" ? "Не менее 6 символов" : "Ваш пароль"} required minLength={6} disabled={busy} className="h-12 rounded-sm bg-card pl-11 pr-12 shadow-none" aria-describedby={msg ? "auth-error" : mode === "up" ? "password-hint" : undefined} />
                      <Button type="button" variant="ghost" size="icon" disabled={busy} onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"} title={showPassword ? "Скрыть пароль" : "Показать пароль"} aria-pressed={showPassword} className="absolute right-1 top-1/2 size-11 -translate-y-1/2 text-muted-foreground">{showPassword ? <EyeOff /> : <Eye />}</Button>
                    </div>
                    {mode === "up" && <p id="password-hint" className="mt-2 text-xs text-muted-foreground">Не менее 6 символов</p>}
                  </div>
                )}
                {msg && <p id="auth-error" role="alert" className="border-l-2 border-destructive pl-3 text-sm leading-6 text-destructive">{msg}</p>}
                <Button type="submit" disabled={busy} className="h-12 w-full rounded-sm text-sm">{busy ? <><Loader2 className="animate-spin" />Подождите…</> : <>{mode === "up" ? "Зарегистрироваться" : mode === "reset" ? "Отправить ссылку" : "Войти"}<ArrowRight /></>}</Button>
              </form>
            )}
            {mode === "up" && !confirmation && <p className="mt-5 text-xs leading-6 text-muted-foreground">Регистрация означает принятие <Link to="/terms" target="_blank" rel="noreferrer" className="underline underline-offset-4">пользовательского соглашения</Link>. Обработка данных — по <Link to="/privacy" target="_blank" rel="noreferrer" className="underline underline-offset-4">политике конфиденциальности</Link>.</p>}
            {mode === "in" && <div className="mt-7 flex flex-wrap items-center justify-center gap-x-2 text-xs text-muted-foreground"><span>Ещё нет аккаунта?</span><Button type="button" variant="editorial" onClick={() => changeMode("up")} disabled={busy} className="h-11 px-1 text-xs font-medium text-primary">Зарегистрироваться</Button></div>}
          </div>
        </div>

        {featured && <figure className="hidden min-w-0 border-l border-border pl-10 lg:block">
          <p className="mb-5 text-[11px] uppercase text-muted-foreground">Из коллекции Юлии Просецкой</p>
          <Link to="/" hash="works" className="block"><img src={featured.image} alt={featured.ru} className="aspect-square w-full object-contain" /></Link>
          <ArtworkCaption work={featured} lang="ru" className="mt-5 border-t border-border pt-4" />
        </figure>}
      </section>

      <footer className="border-t border-border">
        <div className="gallery-shell flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-6 text-[11px] leading-6 text-muted-foreground">
          <span>© 2026 Юлия Просецкая</span>
          <div className="flex flex-wrap gap-x-6 gap-y-1"><Link to="/privacy" className="hover:text-foreground">Политика конфиденциальности</Link><Link to="/terms" className="hover:text-foreground">Пользовательское соглашение</Link></div>
        </div>
      </footer>
    </main>
  );
}
