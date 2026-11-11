import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";

export function LegalPage({ title, sections }: { title: string; sections: { h: string; p: string }[] }) {
  useEffect(() => { document.documentElement.classList.toggle("dark", localStorage.getItem("prosetskaya-theme") === "dark"); }, []);
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border"><div className="gallery-shell flex h-[68px] items-center"><Link to="/" className="flex items-center gap-2 text-xs"><ArrowLeft className="size-4" />Галерея</Link></div></header>
      <article className="mx-auto max-w-[760px] px-5 pb-24 pt-12 md:px-10">
        <h1 className="font-display text-4xl md:text-5xl">{title}</h1>
        <p className="mt-3 text-[11px] text-muted-foreground">Редакция от 11.11.2026 · ИП Просецкая Юлия Владимировна</p>
        {sections.map((s, i) => <section key={s.h} className="mt-10 border-t border-border pt-6"><h2 className="text-lg"><span className="mr-3 text-[10px] text-primary">{String(i + 1).padStart(2, "0")}</span>{s.h}</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">{s.p}</p></section>)}
      </article>
    </main>
  );
}
