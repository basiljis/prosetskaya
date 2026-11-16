import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { ArtistMark } from "@/components/artist-mark";
import { Button } from "@/components/ui/button";
import type { Lang } from "@/lib/artworks";

export function ProjectPageShell({ children }: { children: (lang: Lang) => ReactNode }) {
  const [lang, setLang] = useState<Lang>("ru");
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setLang(localStorage.getItem("prosetskaya-lang") === "en" ? "en" : "ru");
    const theme = localStorage.getItem("prosetskaya-theme") === "dark";
    setDark(theme); document.documentElement.classList.toggle("dark", theme);
  }, []);
  return <main className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-40 border-b border-border bg-background"><div className="gallery-shell flex h-[76px] items-center justify-between gap-3">
      <Button asChild variant="editorial" className="h-auto gap-3 px-0 text-xs"><Link to="/"><ArtistMark className="h-12 w-9 shrink-0" alt="" /><ArrowLeft className="size-4" /><span>{lang === "ru" ? "Галерея" : "Gallery"}</span></Link></Button>
      <div className="flex items-center gap-2"><Button asChild variant="editorial" className="hidden px-3 text-xs sm:inline-flex"><Link to="/projects">{lang === "ru" ? "Спецпроекты" : "Special projects"}</Link></Button><Button variant="editorial" onClick={() => { const next = lang === "ru" ? "en" : "ru"; setLang(next); localStorage.setItem("prosetskaya-lang", next); document.documentElement.lang = next; }} className="px-2 text-xs uppercase" aria-label="Язык / Language">{lang}</Button><Button variant="editorial" size="icon" aria-label={lang === "ru" ? "Сменить тему" : "Change theme"} title={lang === "ru" ? "Сменить тему" : "Change theme"} onClick={() => { setDark(!dark); localStorage.setItem("prosetskaya-theme", dark ? "light" : "dark"); document.documentElement.classList.toggle("dark", !dark); }}>{dark ? <Sun /> : <Moon />}</Button></div>
    </div></header>
    {children(lang)}
    <footer className="mt-12 bg-footer text-footer-foreground"><div className="gallery-shell flex flex-wrap items-center justify-between gap-5 py-8"><p className="text-xs opacity-70">© 2026 Юлия Просецкая</p><Button asChild variant="editorial" className="px-0 text-xs text-footer-foreground"><Link to="/projects">Спецпроекты<ArrowLeft className="size-4" /></Link></Button></div></footer>
  </main>;
}