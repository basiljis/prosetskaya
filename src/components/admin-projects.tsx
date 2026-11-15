import { useState, type FormEvent } from "react";
import { ChevronDown, Loader2, Plus, Save } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { ArtworkRow } from "@/lib/artwork-rows";
import type { Project } from "@/lib/projects";
import { createAdminProject, saveAdminProject, type ProjectPatch } from "@/lib/admin";

export function AdminProjects({ projects, works, onSaved }: { projects: readonly Project[]; works: readonly ArtworkRow[]; onSaved: (note: string) => void }) {
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const create = async (event: FormEvent) => {
    event.preventDefault(); if (!title.trim()) return;
    setBusy(true); setError("");
    try { await createAdminProject(title); setTitle(""); onSaved("Спецпроект создан"); }
    catch (err) { setError(err instanceof Error ? err.message : "Проект не создан"); }
    finally { setBusy(false); }
  };
  return <section>
    <h2 className="font-display text-3xl">Спецпроекты <span className="font-sans text-sm text-muted-foreground">({projects.length})</span></h2>
    <form onSubmit={create} className="mt-5 flex flex-wrap gap-3"><Input aria-label="Название нового проекта" placeholder="Название нового проекта" maxLength={300} value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 min-w-0 flex-1 bg-card" disabled={busy} /><Button type="submit" disabled={busy || !title.trim()} className="h-11">{busy ? <Loader2 className="animate-spin" /> : <Plus />}Добавить</Button></form>
    {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    <ul className="mt-6 border-t border-border">{projects.map((project) => <ProjectEditor key={project.id} project={project} works={works.filter((w) => w.project_id === project.id)} onSaved={onSaved} />)}</ul>
  </section>;
}

function ProjectEditor({ project, works, onSaved }: { project: Project; works: readonly ArtworkRow[]; onSaved: (note: string) => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [interior, setInterior] = useState(project.interior_enabled);
  const [kind, setKind] = useState<Project["kind"]>(project.kind);
  const [cover, setCover] = useState(project.cover_artwork_id ?? "auto");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const get = (key: string) => String(form.get(key) ?? "").trim();
    const patch: ProjectPatch = { title_ru: get("title_ru"), title_en: get("title_en"), description_ru: get("description_ru"), description_en: get("description_en"), year: get("year"), sort_order: Number(get("sort_order")) || 0, kind, interior_enabled: interior, cover_artwork_id: cover === "auto" ? null : cover };
    setBusy(true); setError("");
    try { await saveAdminProject(project.id, patch); onSaved("Спецпроект сохранён"); }
    catch (err) { setError(err instanceof Error ? err.message : "Проект не сохранён"); }
    finally { setBusy(false); }
  };
  return <li className="border-b border-border py-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="min-w-0"><h3 className="break-words text-sm font-medium">{project.title_ru}</h3><p className="mt-1 text-xs text-muted-foreground">{works.length} изображений · {project.interior_enabled ? "В интерьере: включено" : "В интерьере: выключено"}</p></div><div className="flex gap-3"><Button asChild variant="editorial" className="h-10 px-0 text-xs"><Link to="/projects/$projectId" params={{ projectId: project.id }}>Открыть</Link></Button><Button variant="outline" onClick={() => setOpen(!open)} aria-expanded={open} className="h-10">Изменить<ChevronDown className={open ? "rotate-180" : ""} /></Button></div></div>
    {open && <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
      <label className="text-xs text-muted-foreground">Название (RU)<Input name="title_ru" defaultValue={project.title_ru} required maxLength={300} disabled={busy} className="mt-2 bg-card text-foreground" /></label>
      <label className="text-xs text-muted-foreground">Название (EN)<Input name="title_en" defaultValue={project.title_en} maxLength={300} disabled={busy} className="mt-2 bg-card text-foreground" /></label>
      <label className="text-xs text-muted-foreground">Описание (RU)<Textarea name="description_ru" defaultValue={project.description_ru.replace(/\\n/g, "\n")} rows={7} maxLength={15000} disabled={busy} className="mt-2 bg-card text-foreground" /></label>
      <label className="text-xs text-muted-foreground">Описание (EN)<Textarea name="description_en" defaultValue={project.description_en.replace(/\\n/g, "\n")} rows={7} maxLength={15000} disabled={busy} className="mt-2 bg-card text-foreground" /></label>
      <label className="text-xs text-muted-foreground">Год<Input name="year" defaultValue={project.year} maxLength={50} disabled={busy} className="mt-2 bg-card text-foreground" /></label>
      <label className="text-xs text-muted-foreground">Порядок показа<Input name="sort_order" type="number" defaultValue={project.sort_order} disabled={busy} className="mt-2 bg-card text-foreground" /></label>
      <label className="text-xs text-muted-foreground">Тип<Select value={kind} disabled={busy} onValueChange={(value) => setKind(value === "photo" ? "photo" : "painting")}><SelectTrigger className="mt-2 w-full bg-card text-foreground"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="painting">Картины</SelectItem><SelectItem value="photo">Фотографии</SelectItem></SelectContent></Select></label>
      <label className="text-xs text-muted-foreground">Обложка<Select value={cover} disabled={busy} onValueChange={setCover}><SelectTrigger className="mt-2 w-full bg-card text-foreground"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="auto">Первая работа</SelectItem>{works.map((w) => <SelectItem key={w.id} value={w.id}>{w.title_ru}{w.hidden ? " · скрыта" : ""}</SelectItem>)}</SelectContent></Select></label>
      <div className="flex items-center justify-between gap-4 border-y border-border py-4"><label htmlFor={`project-room-${project.id}`} className="text-sm">В интерьере</label><Switch id={`project-room-${project.id}`} checked={interior} disabled={busy} onCheckedChange={setInterior} /></div>
      <div className="flex items-end"><Button type="submit" disabled={busy} className="h-11">{busy ? <Loader2 className="animate-spin" /> : <Save />}Сохранить проект</Button></div>
    </form>}
    {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
  </li>;
}