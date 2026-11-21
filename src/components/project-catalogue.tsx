import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Artwork, Lang } from "@/lib/artworks";
import { projectCover, projectDescription, projectTitle, worksForProject, projectGroups, projectGroupOf, type Project } from "@/lib/projects";

export function ProjectCatalogue({ projects, works, lang, stickyTop = "top-[120px]" }: { projects: readonly Project[]; works: readonly Artwork[]; lang: Lang; stickyTop?: string }) {
  const [selected, setSelected] = useState("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const all = lang === "ru" ? "Все проекты" : "All projects";
  const choices = [{ id: "all", title: all, count: projects.length }, ...projectGroups.map((g) => ({ id: g.id, title: g[lang], count: projects.filter((p) => projectGroupOf(p.id) === g.id).length }))].filter((c) => c.count > 0);
  const current = choices.find((c) => c.id === selected) ?? choices[0];
  const q = query.trim().toLowerCase();
  const filtered = projects.filter((p) => (selected === "all" || projectGroupOf(p.id) === selected) && (!q || [p.title_ru, p.title_en, p.description_ru, p.description_en, p.year].some((v) => v.toLowerCase().includes(q))));
  const ph = lang === "ru" ? "Поиск по проектам" : "Search projects";
  return <>
    <div className={`sticky z-20 ${stickyTop} mt-6 border-y border-border bg-background py-2.5 lg:py-4`} role="group" aria-label={lang === "ru" ? "Фильтры спецпроектов" : "Project filters"}>
      <div className="flex gap-2 lg:items-start">
        <Button variant="editorial" onClick={() => setOpen(!open)} aria-expanded={open} className="h-9 min-w-0 flex-1 justify-between rounded-full border border-primary px-4 text-xs md:hidden"><span className="truncate">{current?.title}</span><ChevronDown className={`transition ${open ? "rotate-180" : ""}`} /></Button>
        <div className="relative w-[42%] md:order-2 md:ml-auto md:w-56">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={ph} aria-label={ph} className="h-9 rounded-full bg-transparent pl-9 pr-8 text-xs shadow-none" />
          {query && <button type="button" onClick={() => setQuery("")} aria-label={lang === "ru" ? "Очистить" : "Clear"} className="absolute right-3 top-2.5 text-muted-foreground"><X className="size-4" /></button>}
        </div>
        <div className="hidden min-w-0 flex-1 gap-2 overflow-x-auto md:flex">
          {choices.map((p) => <Button key={p.id} variant="editorial" onClick={() => setSelected(p.id)} aria-pressed={selected === p.id} className={`h-8 shrink-0 whitespace-nowrap rounded-full border px-3.5 text-[11px] font-medium transition-colors lg:text-xs ${selected === p.id ? "border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground" : "border-border text-muted-foreground hover:border-primary hover:text-primary"}`}>{p.title}<span className="ml-1.5 opacity-60">{p.count}</span></Button>)}
        </div>
      </div>
      {open && <div className="mt-2 grid gap-1 border-t border-border pt-2 md:hidden">{choices.map((p) => <button key={p.id} type="button" onClick={() => { setSelected(p.id); setOpen(false); }} aria-pressed={selected === p.id} className={`border-l-2 px-3 py-2 text-left text-sm ${selected === p.id ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>{p.title}</button>)}</div>}
    </div>
    {filtered.length === 0 && <p className="mt-8 text-sm text-muted-foreground">{lang === "ru" ? "Ничего не найдено" : "Nothing found"}</p>}
    <div className="mt-8 grid gap-x-9 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((project) => { const cover = projectCover(project, works); const count = worksForProject(works, project).length; return <article key={project.id} className="min-w-0">
        <Button asChild variant="artwork" className="group block h-auto w-full whitespace-normal"><Link to="/projects/$projectId" params={{ projectId: project.id }} aria-label={projectTitle(project, lang)}>{cover ? <img src={cover.image} alt={projectTitle(project, lang)} loading="lazy" className="gallery-image transition-transform duration-700 group-hover:scale-[1.015]" /> : <div className="flex h-72 items-center justify-center border border-border text-sm text-muted-foreground">{projectTitle(project, lang)}</div>}</Link></Button>
        <div className="mt-4 border-t border-border pt-4">
          <p className="mb-2 text-[10px] uppercase text-primary">{project.year && `${project.year} · `}{count} {lang === "ru" ? "изображений" : "images"}</p>
          <h3 className="font-display text-2xl leading-tight">{projectTitle(project, lang)}</h3>
          <p className="mt-3 line-clamp-3 text-xs leading-6 text-muted-foreground">{projectDescription(project, lang)}</p>
          <Button asChild variant="editorial" className="mt-4 h-auto border-b border-foreground px-0 pb-2 text-xs"><Link to="/projects/$projectId" params={{ projectId: project.id }}>{lang === "ru" ? "Открыть проект" : "Open project"}<ArrowUpRight /></Link></Button>
        </div>
      </article>; })}
    </div>
  </>;
}
