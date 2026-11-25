import { NotificationBell } from "@/components/notification-bell";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, type ReactNode } from "react";

export function SimplePage({ title, kicker, children, wide }: { title: string; kicker?: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => { document.documentElement.classList.toggle("dark", localStorage.getItem("prosetskaya-theme") === "dark"); }, []);
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border"><div className="gallery-shell flex h-[68px] items-center justify-between"><Link to="/" className="flex items-center gap-2 text-xs"><ArrowLeft className="size-4" />Галерея</Link><div className="flex items-center gap-3"><NotificationBell /><Link to="/account" className="text-xs">Личный кабинет</Link></div></div></header>
      <article className={`mx-auto px-5 pb-24 pt-12 md:px-10 ${wide ? "max-w-[1100px]" : "max-w-[760px]"}`}>
        {kicker && <p className="mb-3 text-[10px] uppercase text-muted-foreground">{kicker}</p>}
        <h1 className="font-display text-4xl md:text-5xl">{title}</h1>
        {children}
      </article>
    </main>
  );
}
