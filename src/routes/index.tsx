import { createFileRoute, Link } from "@tanstack/react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowDown, ArrowUp, ArrowLeft, ArrowRight, ArrowUpRight, Download, Menu, Moon, Settings, Sun, User, X, ZoomIn } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArtworkCaption } from "@/components/artwork-caption";
import { CollectionFilters } from "@/components/collection-filters";
import { SectionMarker } from "@/components/section-marker";
import { ArtistMark } from "@/components/artist-mark";
import { ArtworkViewer } from "@/components/artwork-viewer";
import { artist, artworks as staticArtworks, canPurchaseArtwork, featuredIds, type Category, type Lang } from "@/lib/artworks";
import { copy } from "@/lib/gallery-copy";
import { filterArtworks, nextArtworkIndex } from "@/lib/gallery-navigation";
import { InquiryDialog } from "@/components/inquiry-dialog";
import { availability, boutique } from "@/lib/boutique";
import { ContactDialog } from "@/components/contact-dialog";
import cvPdf from "@/assets/prosetskaya-cv.pdf.asset.json";
import { CheckoutDialog } from "@/components/checkout-dialog";
import { useShop } from "@/hooks/use-shop";
import { rub } from "@/lib/shop";
import { useArtworks } from "@/hooks/use-artworks";
import portraitAsset from "@/assets/prosetskaya/portrait.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Юлия Просецкая — галерея живописи и цифрового искусства" },
    { name: "description", content: "Галерея художницы Юлии Просецкой: живопись, пейзажи, цифровое искусство, графика и флуоресцентные работы. Биография и контакты художницы." },
    { property: "og:title", content: "Юлия Просецкая — галерея художника" },
    { property: "og:description", content: "Полная коллекция живописи, пейзажей, графики и цифровых работ Юлии Просецкой." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

const featuredWorks = featuredIds.map((id) => staticArtworks.find((work) => work.id === id)).filter((work) => work !== undefined);

function Index() {
  const artworks = useArtworks();
  const [lang, setLang] = useState<Lang>("ru");
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState<Category>("all");
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const t = copy[lang];
  const b = boutique[lang];
  const [inquiryId, setInquiryId] = useState<string | null>(null);
  const inquiryWork = artworks.find((w) => w.id === inquiryId);
  const shop = useShop().data;
  const [buyId, setBuyId] = useState<string | null>(null);
  const buyWork = artworks.find((w) => w.id === buyId);
  const filtered = filterArtworks(artworks, category);
  const featured = featuredWorks[featuredIndex];
  const left = artworks.find((work) => work.id === "anniversary-bouquet");
  const right = artworks.find((work) => work.id === "pink-rain");

  useEffect(() => {
    const savedLang = localStorage.getItem("prosetskaya-lang") ?? localStorage.getItem("dikunova-lang");
    const savedTheme = localStorage.getItem("prosetskaya-theme") ?? localStorage.getItem("dikunova-theme");
    if (savedLang === "ru" || savedLang === "en") setLang(savedLang);
    setDark(savedTheme === "dark");
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("prosetskaya-theme", dark ? "dark" : "light");
  }, [dark, ready]);
  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = lang;
    localStorage.setItem("prosetskaya-lang", lang);
  }, [lang, ready]);
  useEffect(() => {
    if (viewerIndex !== null || menuOpen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setFeaturedIndex((index) => nextArtworkIndex(index, 1, featuredWorks.length)), 6500);
    return () => window.clearInterval(timer);
  }, [viewerIndex, menuOpen]);

  const openWork = (id: string) => {
    const index = artworks.findIndex((work) => work.id === id);
    if (index >= 0) setViewerIndex(index);
  };
  const smoothTo = (top: number) => {
    const start = window.scrollY; const end = Math.max(0, Math.min(top, document.documentElement.scrollHeight - window.innerHeight)); const t0 = performance.now();
    const duration = Math.min(1100, 450 + Math.abs(end - start) / 8);
    const step = (now: number) => { const p = Math.min(1, (now - t0) / duration); const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; window.scrollTo(0, start + (end - start) * e); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  const scrollToSection = (hash: string) => { const el = document.querySelector(hash); if (el) smoothTo(el.getBoundingClientRect().top + window.scrollY - 76); history.replaceState(null, "", hash); };
  const navLinks = [{ label: t.works, href: "#works" }, { label: b.projectsLabel, href: "#projects" }, { label: t.about, href: "#about" }, { label: t.contact, href: "#contact" }];

  return (
    <main className="min-h-screen bg-background text-foreground">
      {ready && <div className="preloader pointer-events-none fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-background text-foreground md:gap-5" aria-hidden="true"><ArtistMark kind="signature" className="animate-reveal h-16 w-60 max-w-[70%] md:h-24 md:w-[22rem]" alt="" /><p className="animate-reveal px-5 text-center font-sans text-xl font-medium uppercase tracking-[0.14em] md:text-3xl">{t.name}</p><p className="animate-reveal text-[10px] uppercase tracking-[0.35em] text-primary md:text-xs">{t.signature}</p></div>}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="gallery-shell flex h-[76px] items-center justify-between gap-4">
          <a href="#top" onClick={(e) => { e.preventDefault(); smoothTo(0); }} className="flex min-w-0 items-center gap-3" aria-label={t.name}><ArtistMark className="h-14 w-10 shrink-0" alt="" /><span className="hidden border-l border-border pl-3 text-[10px] leading-4 sm:block">{t.gallery}<br />{t.location}</span></a>
          <nav className="hidden items-center gap-8 lg:flex" aria-label={t.menu}>{navLinks.map((link) => <Button key={link.href} asChild variant="editorial" className="h-auto p-0 text-xs"><a href={link.href} onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}>{link.label}</a></Button>)}</nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="editorial" className="h-9 gap-2 px-3 text-[11px] font-semibold uppercase"><Link to="/account" aria-label={lang === "ru" ? "Личный кабинет" : "Account"}><User className="size-4" /><span className="hidden sm:inline">{lang === "ru" ? "Кабинет" : "Account"}</span></Link></Button>
            <Button variant="editorial" onClick={() => setLang(lang === "ru" ? "en" : "ru")} aria-label={t.language} title={t.language} className="h-9 px-2 text-[11px] font-semibold uppercase">{lang}<span className="text-muted-foreground">/</span>{lang === "ru" ? "en" : "ru"}</Button>
            <Button variant="editorial" size="icon" onClick={() => setDark(!dark)} aria-label={t.theme} title={t.theme}>{dark ? <Sun /> : <Moon />}</Button>
            <Button variant="editorial" size="icon" onClick={() => setMenuOpen(true)} aria-label={t.menu} title={t.menu} className="lg:hidden"><Menu /></Button>
          </div>
        </div>
      </header>

      <section id="top" className="gallery-shell pb-4 pt-6 md:pb-8 md:pt-10">
        <div className="mb-5 flex items-center justify-between text-[10px] uppercase text-muted-foreground"><span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-primary" />{t.gallery}</span><span>{t.location}</span></div>
        <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
          <h1 className="artist-title font-sans"><span className="block">{t.firstName}</span><span>{t.lastName}<span className="text-primary">.</span></span></h1>
          <div className="pb-2 md:max-w-[220px] md:text-right"><p className="text-sm leading-6">{t.intro}</p><Button asChild variant="editorial" className="mt-3 h-auto p-0 text-[10px] uppercase"><a href="#works" onClick={(e) => { e.preventDefault(); scrollToSection("#works"); }}>{t.allWorks}<ArrowDown className="ml-2" /></a></Button></div>
        </div>

        <div className="mt-6 grid grid-cols-[1fr_2fr_1fr] items-center gap-5 md:mt-10 md:grid-cols-[1fr_1.65fr_1fr] md:gap-14">
          <div className="hidden sm:block">{left && <Button variant="artwork" className="block w-full cursor-zoom-in" onClick={() => openWork(left.id)} aria-label={`${t.view}: ${left[lang]}`}><img className="featured-side" src={left.image} alt={left[lang]} /></Button>}<p className="mt-4 text-[10px] text-muted-foreground">01 / {t.categories.painting}</p></div>
          <div className="col-span-3 sm:col-span-1">
            {featured && <Button variant="artwork" className="featured-stage relative block w-full cursor-zoom-in" onClick={() => openWork(featured.id)} aria-label={`${t.view}: ${featured[lang]}`}>
              {featuredWorks.map((work, index) => <img key={work.id} src={work.image} alt={index === featuredIndex ? work[lang] : ""} aria-hidden={index !== featuredIndex} fetchPriority={index === 0 ? "high" : "auto"} className={`featured-main absolute inset-0 transition-opacity duration-[1200ms] ${index === featuredIndex ? "opacity-100" : "opacity-0"}`} />)}
            </Button>}
          </div>
          <div className="hidden sm:block">{right && <Button variant="artwork" className="block w-full cursor-zoom-in" onClick={() => openWork(right.id)} aria-label={`${t.view}: ${right[lang]}`}><img className="featured-side" src={right.image} alt={right[lang]} /></Button>}<p className="mt-4 text-right text-[10px] text-muted-foreground">03 / {t.categories.digital}</p></div>
        </div>
        <div className="mt-5 flex items-center justify-between gap-5 border-b border-border pb-5">
          <span className="hidden text-[10px] text-muted-foreground md:block">{t.selected} / 01—03</span>
          {featured && <p className="text-xs">{featured[lang]}<span className="ml-3 text-[10px] text-muted-foreground">{featured.year}</span></p>}
          <div className="flex shrink-0 items-center gap-3"><Button variant="editorial" size="icon" onClick={() => setFeaturedIndex((index) => nextArtworkIndex(index, -1, featuredWorks.length))} aria-label={t.previous} title={t.previous}><ArrowLeft /></Button><span className="text-[10px] tabular-nums text-muted-foreground">0{featuredIndex + 1} / 03</span><Button variant="editorial" size="icon" onClick={() => setFeaturedIndex((index) => nextArtworkIndex(index, 1, featuredWorks.length))} aria-label={t.next} title={t.next}><ArrowRight /></Button></div>
        </div>
      </section>

      <section id="works" className="gallery-shell pb-12 pt-4 md:pb-16 md:pt-6">
        <SectionMarker number="01">{t.collection}</SectionMarker>
        <div className="flex items-end justify-between gap-6"><div><h2 className="section-heading font-display">{t.allWorks}<span className="ml-3 align-top font-sans text-sm text-primary">({String(filtered.length).padStart(2, "0")})</span></h2></div><p className="hidden max-w-60 text-xs leading-6 text-muted-foreground md:block">{t.artistNote}</p></div>
        <div className={`mt-5 grid gap-y-8 ${shop?.collectionMenuPosition === "left" ? "lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-x-9" : ""}`}>
        <CollectionFilters position={shop?.collectionMenuPosition ?? "top"} category={category} lang={lang} onChange={(key) => { setCategory(key); scrollToSection("#works"); }} />
        <div className={`grid min-w-0 grid-cols-1 gap-x-9 gap-y-10 sm:grid-cols-2 ${shop?.collectionMenuPosition === "left" ? "2xl:grid-cols-3" : "lg:grid-cols-3"}`}>
          {filtered.map((work) => <article key={work.id} className="gallery-column min-w-0">
            <Button variant="artwork" className="group relative block w-full cursor-zoom-in overflow-hidden" onClick={() => openWork(work.id)} aria-label={`${t.view}: ${work[lang]}`}>
              <img src={work.image} alt={work[lang]} loading="lazy" className="gallery-image transition-transform duration-700 group-hover:scale-[1.015]" />
              <span className="absolute bottom-3 right-3 grid size-9 place-items-center bg-background text-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"><ZoomIn /></span>
            </Button>
            <ArtworkCaption work={work} lang={lang} className="mt-5 border-t border-border pt-3" />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px]"><span className="text-muted-foreground">{work.catalogueOnly ? (lang === "ru" ? "Авторский проект" : "Artist project") : work.sourceAvailability === "museum" ? (lang === "ru" ? "В музейной коллекции" : "In a museum collection") : work.sourceAvailability === "private" ? (lang === "ru" ? "В частной коллекции" : "In a private collection") : work.sourceAvailability === "sold" || shop?.reserved.has(work.id) ? (lang === "ru" ? "Продана / забронирована" : "Sold / reserved") : <>{availability(work) === "print" ? b.print : b.original}{shop?.showPrices && shop.prices[work.id] ? <b className="ml-2 font-medium text-foreground">{rub(shop.prices[work.id])}</b> : null}</>}</span><span className="flex gap-4"><Button variant="editorial" onClick={() => setInquiryId(work.id)} className="h-auto px-0 pb-1 text-[11px] text-muted-foreground">{lang === "ru" ? "Вопрос" : "Ask"}</Button>{canPurchaseArtwork(work) && !shop?.reserved.has(work.id) && <Button variant="editorial" onClick={() => setBuyId(work.id)} className="h-auto border-b border-foreground px-0 pb-1 text-[11px]">{lang === "ru" ? "Купить" : "Buy"}<ArrowUpRight /></Button>}</span></div>
          </article>)}
        </div>
        </div>
      </section>

      <section id="projects" className="gallery-shell border-t border-border py-10 md:py-16">
        <SectionMarker number="02">{b.projectsLabel}</SectionMarker>
        <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-20"><div><h2 className="section-heading font-display">{b.projectsTitle}</h2><p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">{b.projectsText}</p><Button asChild variant="editorial" className="mt-6 h-auto border-b border-foreground px-0 pb-2 text-xs"><a href={artist.telegram} target="_blank" rel="noreferrer">{b.commission}<ArrowUpRight /></a></Button></div>
          <div className="border-t border-border">{b.projects.map((p) => <div key={p.title} className="grid grid-cols-[56px_1fr_auto] items-center gap-5 border-b border-border py-6"><span className="text-xs text-primary">{p.year}</span><span><span className="block font-display text-2xl">{p.title}</span><span className="mt-1 block text-[11px] text-muted-foreground">{p.note}</span></span><span /></div>)}</div></div>
      </section>

      <section id="about" className="border-t border-border bg-muted/45 py-10 md:py-16">
        <SectionMarker number="03" fullWidth>{t.about}</SectionMarker>
        <div className="gallery-shell grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
          <div><h2 className="section-heading font-display">{t.name}</h2><figure className="mt-9 max-w-80"><img src={portraitAsset.url} alt={t.portrait} loading="lazy" className="aspect-[4/5] w-full object-cover" /><figcaption className="mt-3 text-[10px] text-muted-foreground">{t.portrait} · {t.location}</figcaption></figure></div>
          <div className="md:pt-12"><p className="font-display text-3xl leading-[1.35] md:text-4xl">{t.bio}</p><p className="mt-7 max-w-xl text-sm leading-7 text-muted-foreground">{t.bioSecond}</p>
            <div className="mt-10 border-t border-border">{[{ year: "2009", title: t.education, note: t.educationNote }, { year: "2021", title: t.project, note: t.projectNote }, { year: "2022", title: t.exhibition, note: t.exhibitionNote }].map((item) => <div key={item.year} className="grid grid-cols-[50px_1fr] gap-5 border-b border-border py-5"><span className="pt-1 text-xs text-primary">{item.year}</span><div><p className="text-sm">{item.title}</p><p className="mt-1 text-[11px] text-muted-foreground">{item.note}</p></div></div>)}</div>
            <div className="mt-7 flex flex-wrap gap-6"><Link to="/cv" className="inline-flex items-center gap-2 border-b border-foreground pb-2 text-xs">{lang === "ru" ? "Подробнее" : "Read more"}<ArrowUpRight className="size-4" /></Link><a href={cvPdf.url} download="prosetskaya-cv.pdf" className="inline-flex items-center gap-2 border-b border-foreground pb-2 text-xs">{lang === "ru" ? "Скачать CV в PDF" : "Download CV (PDF)"}<Download className="size-4" /></a></div>
            <ArtistMark kind="signature" className="mt-10 h-20 w-60 max-w-full" alt={lang === "ru" ? "Подпись Юлии Просецкой" : "Yulia Prosetskaya’s signature"} />
          </div>
        </div>
      </section>

      <footer id="contact" className="bg-footer text-footer-foreground">
        <div className="gallery-shell pb-7 pt-10 md:pt-14">
          <SectionMarker number="04" inverse>{t.contact}</SectionMarker>
          <div className="grid gap-12 md:grid-cols-[1.2fr_1fr]"><div><h2 className="section-heading font-display">{t.enquiryTitle}</h2><p className="mt-5 max-w-xs text-xs leading-6 opacity-60">{t.enquiryText}</p><ContactDialog lang={lang}><button type="button" className="mt-7 inline-flex items-center gap-8 border-b border-footer-foreground/50 pb-2 text-sm">{t.write}<ArrowUpRight className="size-4" /></button></ContactDialog></div>
            <div className="space-y-6 md:pt-9"><a href={`mailto:${artist.email}`} className="block break-all text-lg md:text-xl">{artist.email}</a><a href={artist.phoneHref} className="block text-lg">{artist.phone}</a><p className="text-xs opacity-60">{t.address}</p><div className="flex flex-wrap gap-7 pt-4 text-xs"><a href={artist.telegram} target="_blank" rel="noreferrer" className="flex items-center gap-1">Telegram<ArrowUpRight className="size-3" /></a><a href={artist.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-1">Instagram<ArrowUpRight className="size-3" /></a><a href={artist.whatsapp} target="_blank" rel="noreferrer" className="flex items-center gap-1">WhatsApp<ArrowUpRight className="size-3" /></a></div></div>
          </div>
          <div className="mt-10 border-t border-footer-foreground/20">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-5">
              <nav aria-label={lang === "ru" ? "Информация" : "Information"} className="grid min-w-0 grid-cols-2 gap-x-6 gap-y-1 text-xs leading-6 text-footer-foreground/85 sm:flex sm:flex-wrap sm:gap-x-8">
                <Link to="/buy" className="py-1 hover:text-footer-foreground">{lang === "ru" ? "Как купить" : "How to buy"}</Link>
                <Link to="/delivery" className="py-1 hover:text-footer-foreground">{lang === "ru" ? "Доставка" : "Delivery"}</Link>
                <Link to="/requisites" className="py-1 hover:text-footer-foreground">{lang === "ru" ? "Реквизиты" : "Bank details"}</Link>
                <Link to="/account" className="py-1 hover:text-footer-foreground">{lang === "ru" ? "Личный кабинет" : "Account"}</Link>
              </nav>
              <Button asChild variant="editorial" size="icon" className="size-10 shrink-0 text-footer-foreground/70 hover:text-footer-foreground"><Link to="/admin" onClick={() => sessionStorage.setItem("after-login", "/admin")} aria-label={lang === "ru" ? "Административная панель" : "Administration"} title={lang === "ru" ? "Административная панель" : "Administration"}><Settings className="size-4" /></Link></Button>
            </div>
            <div className="grid gap-5 border-t border-footer-foreground/15 pt-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start xl:gap-8">
              <nav aria-label={lang === "ru" ? "Правовая информация" : "Legal information"} className="flex min-w-0 flex-wrap gap-x-7 gap-y-2 text-[11px] leading-6 text-footer-foreground/65 xl:col-start-2 xl:row-start-1">
                <Link to="/privacy" className="hover:text-footer-foreground">{lang === "ru" ? "Политика конфиденциальности" : "Privacy policy"}</Link>
                <Link to="/terms" className="hover:text-footer-foreground">{lang === "ru" ? "Пользовательское соглашение" : "Terms of use"}</Link>
              </nav>
              <span className="min-w-0 max-w-xl text-[10px] leading-5 text-footer-foreground/50 xl:col-start-1 xl:row-start-1">© 2026 {t.rights} · {b.legal}</span>
            </div>
          </div>
        </div>
      </footer>

      <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <Dialog.Portal>
          <Dialog.Content aria-describedby={undefined} className="fixed inset-0 z-[80] flex flex-col bg-background text-foreground">
            <div className="shrink-0 border-b border-border">
              <div className="gallery-shell grid min-h-[76px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-4">
                <div className="flex min-w-0 items-center gap-3"><ArtistMark className="hidden h-12 w-9 shrink-0 sm:block" alt="" /><Dialog.Title className="min-w-0 font-sans text-xl font-medium leading-tight sm:text-2xl">{t.name}</Dialog.Title></div>
                <div className="flex shrink-0 items-center gap-2 sm:gap-4"><span className="text-xs text-muted-foreground sm:text-sm">{t.menu}</span><Button variant="editorial" size="icon" onClick={() => setMenuOpen(false)} aria-label={t.close} title={t.close}><X /></Button></div>
              </div>
            </div>
            <nav aria-label={t.menu} className="gallery-shell flex min-h-0 flex-1 flex-col justify-center overflow-y-auto py-6">
              {navLinks.map((link, index) => <Button key={link.href} asChild variant="editorial" className="h-auto shrink-0 justify-start rounded-none border-b border-border px-0 py-5 font-display text-3xl sm:py-6 sm:text-5xl"><a href={link.href} onClick={(event) => { event.preventDefault(); setMenuOpen(false); window.setTimeout(() => { scrollToSection(link.href); }, 100); }} className="grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-3 sm:gap-4"><span className="self-start pt-1 font-sans text-[10px] text-primary">0{index + 1}</span><span className="min-w-0 whitespace-normal">{link.label}</span><ArrowUpRight className="size-6 shrink-0 sm:size-7" /></a></Button>)}
            </nav>
            <div className="shrink-0 border-t border-border">
              <div className="gallery-shell grid gap-4 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:py-6">
                <Button asChild variant="editorial" className="h-11 w-fit max-w-full justify-start px-0 text-sm"><Link to="/account" onClick={() => setMenuOpen(false)}><User className="shrink-0" /><span className="min-w-0 whitespace-normal">{lang === "ru" ? "Вход в личный кабинет" : "My account"}</span><ArrowUpRight className="shrink-0" /></Link></Button>
                <p className="text-xs leading-5 text-muted-foreground">© 2026 {t.rights}</p>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <div className="fixed bottom-5 right-4 z-40 flex flex-col gap-2">
        <Button variant="outline" size="icon" className="bg-background/90 backdrop-blur" onClick={() => smoothTo(0)} aria-label={lang === "ru" ? "В начало страницы" : "To top"} title={lang === "ru" ? "В начало страницы" : "To top"}><ArrowUp /></Button>
        <Button variant="outline" size="icon" className="bg-background/90 backdrop-blur" onClick={() => smoothTo(document.documentElement.scrollHeight)} aria-label={lang === "ru" ? "В конец страницы" : "To bottom"} title={lang === "ru" ? "В конец страницы" : "To bottom"}><ArrowDown /></Button>
      </div>
      {inquiryWork && <InquiryDialog work={inquiryWork} lang={lang} onClose={() => setInquiryId(null)} />}
      {buyWork && <CheckoutDialog work={buyWork} price={shop?.prices[buyWork.id] ?? null} online={!!shop?.online} onClose={() => setBuyId(null)} />}
      {viewerIndex !== null && <ArtworkViewer works={artworks} index={viewerIndex} lang={lang} onChange={setViewerIndex} onClose={() => setViewerIndex(null)} />}
    </main>
  );
}
