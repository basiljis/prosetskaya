import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Artwork, Lang } from "@/lib/artworks";
import { projectCover, projectDescription, projectTitle, worksForProject, type Project } from "@/lib/projects";

export function ProjectCatalogue({ projects, works, lang }: { projects: readonly Project[]; works: readonly Artwork[]; lang: Lang }) {
  const [selected, setSelected] = useState("all");
  const all = lang === "ru" ? "Все проекты" : "All projects";
  const choices = [{ id: "all", title: all }, ...projects.map((p) => ({ id: p.id, title: projectTitle(p, lang) }))];
  const filtered = projects.filter((p) => selected === "all" || selected === p.id);
  return <>
    <div className="mt-6 border-y border-border py-3" role="group" aria-label={lang === "ru" ? "Фильтры спецпроектов" : "Project filters"}>
      <div className="md:hidden"><Select value={selected} onValueChange={setSelected}><SelectTrigger aria-label={lang === "ru" ? "Выбрать спецпроект" : "Choose project"} className="h-11 w-full bg-transparent"><Menu className="size-4 shrink-0" /><SelectValue /></SelectTrigger><SelectContent>{choices.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent></Select></div>
      <div className="hidden flex-wrap gap-2 md:flex">{choices.map((p) => <Button key={p.id} variant="editorial" onClick={() => setSelected(p.id)} aria-pressed={selected === p.id} className={`h-auto min-h-9 max-w-full whitespace-normal rounded-full border px-4 py-2 text-xs ${selected === p.id ? "border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "border-border text-muted-foreground hover:border-primary hover:text-primary"}`}>{p.title}</Button>)}</div>
    </div>
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