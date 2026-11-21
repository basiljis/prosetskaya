import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronDown, Search, Shapes, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Artwork, Lang } from "@/lib/artworks";
import { projectCover, projectDescription, projectTitle, worksForProject, projectGroups, projectGroupOf, type Project } from "@/lib/projects";

export function ProjectCatalogue({ projects, works, lang, stickyTop = "top-[120px]" }: { projects: readonly Project[]; works: readonly Artwork[]; lang: Lang; stickyTop?: string }) {
  const [selected, setSelected] = useState("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searching = searchOpen || !!query;
  const setSearching = setSearchOpen;
  const all = lang === "ru" ? "Все проекты" : "All projects";
  const choices = [{ id: "all", title: all, count: projects.length }, ...projectGroups.map((g) => ({ id: g.id, title: g[lang], count: projects.filter((p) => projectGroupOf(p.id) === g.id).length }))].filter((c) => c.count > 0);
  const current = choices.find((c) => c.id === selected) ?? choices[0];
  const q = query.trim().toLowerCase();
  const filtered = projects.filter((p) => (selected === "all" || projectGroupOf(p.id) === selected) && (!q || [p.title_ru, p.title_en, p.description_ru, p.description_en, p.year].some((v) => v.toLowerCase().includes(q))));
  const ph = lang === "ru" ? "Поиск по проектам" : "Search projects";
  const search = <div className="relative">
    <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
    <Input autoFocus={searchOpen} value={query} onChange={(e) => setQuery(e.target.value)} placeholder={ph} aria-label={ph} className="h-9 rounded-full bg-transparent pl-9 pr-8 text-xs shadow-none" />
    {(query || searchOpen) && <button type="button" onClick={() => { setQuery(""); setSearchOpen(false); }} aria-label={lang === "ru" ? "Очистить" : "Clear"} className="absolute right-3 top-2.5 text-muted-foreground"><X className="size-4" /></button>}
  </div>;
  return <>
    <div className={`sticky z-20 ${stickyTop} mt-6 border-y border-border bg-background py-2.5 lg:py-3`} role="group" aria-label={lang === "ru" ? "Фильтры спецпроектов" : "Project filters"}>
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="editorial" aria-label={all} className={`h-9 min-w-0 justify-between gap-2 rounded-full border text-xs md:hidden ${searching ? "w-9 shrink-0 px-0" : "flex-1 px-4"} ${selected !== "all" ? "border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "border-border text-muted-foreground"}`}>{searching ? <Shapes className="mx-auto size-4" /> : <><span className="truncate">{current?.title}</span><ChevronDown className="size-4 shrink-0" /></>}</Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 p-2">{choices.map((p) => <button key={p.id} type="button" onClick={() => { setSelected(p.id); setOpen(false); setSearching(false); }} className={`flex w-full justify-between rounded-sm px-2 py-2 text-left text-sm ${selected === p.id ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}><span>{p.title}</span><span className="opacity-60">{p.count}</span></button>)}</PopoverContent>
        </Popover>
        <div className="hidden min-w-0 flex-1 flex-wrap gap-2 md:flex">
          {choices.map((p) => <Button key={p.id} variant="editorial" onClick={() => setSelected(p.id)} aria-pressed={selected === p.id} className={`h-8 shrink-0 whitespace-nowrap rounded-full border px-3 text-[11px] font-medium transition-colors lg:text-xs ${selected === p.id ? "border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground" : "border-border text-muted-foreground hover:border-primary hover:text-primary"}`}>{p.title}<span className="ml-1 opacity-60">{p.count}</span></Button>)}
        </div>
        <div className={`min-w-0 md:block md:w-52 md:flex-none ${searching ? "flex-1" : "hidden"}`}>{search}</div>
        {!searching && <Button variant="editorial" onClick={() => setSearchOpen(true)} aria-label={ph} className="size-9 shrink-0 rounded-full border border-border p-0 text-muted-foreground md:hidden"><Search className="size-4" /></Button>}
      </div>
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
