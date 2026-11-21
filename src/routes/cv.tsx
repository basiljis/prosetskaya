import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useShop } from "@/hooks/use-shop";
import { resolveCv } from "@/lib/cv";
import cvPdf from "@/assets/prosetskaya-cv.pdf.asset.json";
import portraitAsset from "@/assets/prosetskaya/portrait.jpg.asset.json";
import { artist, type Lang } from "@/lib/artworks";

export const Route = createFileRoute("/cv")({
  head: () => ({ meta: [
    { title: "Юлия Просецкая — CV художника" },
    { name: "description", content: "Резюме художницы Юлии Просецкой: образование, персональные и групповые выставки, спецпроекты, награды. Скачать CV в PDF." },
    { property: "og:title", content: "Юлия Просецкая — CV" },
    { property: "og:description", content: "Образование, выставки, проекты и награды Юлии Просецкой." },
    { property: "og:type", content: "profile" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: CvPage,
});

function CvPage() {
  const cv = resolveCv(useShop().data?.cv);
  const [lang, setLang] = useState<Lang>("ru");
  useEffect(() => {
    const saved = localStorage.getItem("prosetskaya-lang");
    if (saved === "en") setLang("en");
    document.documentElement.classList.toggle("dark", localStorage.getItem("prosetskaya-theme") === "dark");
  }, []);
  const en = lang === "en";
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="gallery-shell flex h-[68px] items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xs"><ArrowLeft className="size-4" />{en ? "Gallery" : "Галерея"}</Link>
          <Link to="/" className="text-sm tracking-[0.3em] uppercase">{en ? cv.nameEn : cv.name}<span className="ml-2 text-[10px] tracking-normal normal-case text-muted-foreground">/ artist</span></Link>
          <span className="w-16" />
        </div>
      </header>
      <div className="mx-auto w-full max-w-[1000px] px-5 pb-24 pt-10 md:px-10">
        <nav className="text-[10px] text-muted-foreground"><Link to="/">{en ? "Home" : "Главная"}</Link><span className="mx-2 text-primary">/</span>{en ? "About / CV" : "Об авторе / CV"}</nav>
        <section className="mt-8 grid gap-10 md:grid-cols-[1fr_300px] md:gap-14">
          <div>
            <h1 className="text-5xl font-normal leading-tight md:text-6xl">{en ? cv.nameEn : cv.name}</h1>
            <p className="mt-6 text-sm leading-7">{en ? cv.leadEn : cv.lead}</p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{en ? cv.factsEn : cv.facts}</p>
            <a href={cvPdf.url} download="prosetskaya-cv.pdf" className="mt-8 flex items-center gap-2 border-y border-border py-4 text-xs hover:text-primary"><Download className="size-4" />{en ? "Download CV (PDF)" : "Скачать CV (PDF)"}</a>
          </div>
          <img src={portraitAsset.url} alt={en ? cv.nameEn : cv.name} className="aspect-[4/5] w-full object-cover grayscale" />
        </section>
        <div className="mt-16">
          {cv.sections.map((s, i) => (
            <section key={s.ru} className="grid gap-4 border-t border-border py-8 md:grid-cols-[1fr_1.8fr] md:gap-10">
              <h2 className="flex items-baseline gap-3 text-xl tracking-[0.06em]"><span className="text-[10px] text-primary">{String(i + 1).padStart(2, "0")}</span>{en ? s.en : s.ru}</h2>
              <ul className="space-y-3 text-sm leading-6">{(en && s.itemsEn?.length ? s.itemsEn : s.items).map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
          ))}
          <section className="grid gap-4 border-t border-border py-8 md:grid-cols-[1fr_1.8fr] md:gap-10">
            <h2 className="text-xl tracking-[0.06em]">{en ? "Contacts" : "Контакты"}</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <a href={`mailto:${artist.email}`} className="flex items-center gap-1">{artist.email}<ArrowUpRight className="size-3" /></a>
              <a href={artist.phoneHref}>{artist.phone}</a>
              <a href={artist.telegram} target="_blank" rel="noreferrer" className="flex items-center gap-1">Telegram<ArrowUpRight className="size-3" /></a>
              <a href={artist.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-1">Instagram<ArrowUpRight className="size-3" /></a>
              <a href={artist.whatsapp} target="_blank" rel="noreferrer" className="flex items-center gap-1">WhatsApp<ArrowUpRight className="size-3" /></a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
