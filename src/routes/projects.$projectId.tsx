import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowUpRight, ZoomIn } from "lucide-react";
import { ProjectPageShell } from "@/components/project-page-shell";
import { ArtworkCaption } from "@/components/artwork-caption";
import { ArtworkViewer } from "@/components/artwork-viewer";
import { ContactDialog } from "@/components/contact-dialog";
import { Button } from "@/components/ui/button";
import { publicProjectsOptions } from "@/lib/projects-query";
import { projectCover, projectDescription, projectTitle, worksForProject } from "@/lib/projects";

export const Route = createFileRoute("/projects/$projectId")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(publicProjectsOptions);
    const project = data.projects.find((p) => p.id === params.projectId);
    if (!project) throw notFound();
    return { project, works: worksForProject(data.works, project), projects: data.projects };
  },
  head: ({ loaderData }) => {
    const project = loaderData?.project;
    const title = project ? `${project.title_ru} — Юлия Просецкая` : "Проект недоступен — Юлия Просецкая";
    const description = project ? projectDescription(project, "ru").slice(0, 220) : "Спецпроекты художницы Юлии Просецкой.";
    const image = project && loaderData ? projectCover(project, loaderData.works)?.image : undefined;
    return { meta: [
      { title }, { name: "description", content: description }, { property: "og:title", content: title },
      { property: "og:description", content: description }, { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      ...(image?.startsWith("https://") ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
      ...(!project ? [{ name: "robots", content: "noindex" }] : []),
    ] };
  },
  component: ProjectPage,
});

/** Projects whose works are split into sub-sections by medium. */
const MURAL_SECTIONS: Record<string, { medium: string | null; ru: string; en: string }[]> = {
  murals: [{ medium: "Роспись стены", ru: "Стены", en: "Walls" }, { medium: "Роспись потолка", ru: "Потолки", en: "Ceilings" }],
};

function ProjectPage() {
  const { project, works, projects } = Route.useLoaderData();
  const [index, setIndex] = useState<number | null>(null);
  return <ProjectPageShell>{(lang) => <article className="gallery-shell py-8 md:py-12">
    <Button asChild variant="editorial" className="mb-8 h-auto px-0 text-xs text-muted-foreground"><Link to="/projects"><ArrowLeft />{lang === "ru" ? "Все спецпроекты" : "All special projects"}</Link></Button>
    <p className="mb-3 text-xs uppercase text-primary">{project.year && `${project.year} · `}{lang === "ru" ? "Юлия Просецкая / Спецпроект" : "Yulia Prosetskaya / Special project"}</p>
    <h1 className="max-w-5xl font-display text-4xl leading-tight md:text-6xl">{projectTitle(project, lang)}</h1>
    <div className="mt-6 max-w-3xl whitespace-pre-line text-sm leading-7 text-muted-foreground">{projectDescription(project, lang)}</div>
    <ContactDialog lang={lang}><Button variant="editorial" className="mt-6 h-auto border-b border-foreground px-0 pb-2 text-xs">{lang === "ru" ? "Обсудить проект" : "Discuss a project"}<ArrowUpRight /></Button></ContactDialog>
    {(MURAL_SECTIONS[project.id] ?? [{ medium: null, ru: "", en: "" }]).map((sec) => {
      const list = works.map((work, i) => ({ work, i })).filter(({ work }) => !sec.medium || work.mediumRu === sec.medium);
      return <section key={sec.ru || "all"} className="mt-10">
        {sec.medium && <h2 className="font-display text-3xl">{lang === "ru" ? sec.ru : sec.en} <span className="font-sans text-sm text-primary">({list.length})</span></h2>}
        {list.length === 0 ? <p className="mt-4 border-t border-border pt-6 text-sm text-muted-foreground">{lang === "ru" ? "Фотографии скоро появятся." : "Photos coming soon."}</p> :
        <div className="mt-4 grid gap-x-9 gap-y-10 border-t border-border pt-8 sm:grid-cols-2 lg:grid-cols-3">{list.map(({ work, i }) => <figure key={work.id} className="min-w-0">
      <Button variant="artwork" onClick={() => setIndex(i)} aria-label={`${lang === "ru" ? "Смотреть" : "View"}: ${work[lang]}`} className="group relative block w-full cursor-zoom-in"><img src={work.image} alt={work[lang]} loading="lazy" className="gallery-image" /><span className="absolute bottom-3 right-3 grid size-9 place-items-center bg-background text-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"><ZoomIn className="size-4" /></span></Button>
      <ArtworkCaption work={work} lang={lang} className="mt-4 border-t border-border pt-3" />
    </figure>)}</div>}
      </section>;
    })}
    {index !== null && <ArtworkViewer works={works} index={index} lang={lang} projects={projects} onChange={setIndex} onClose={() => setIndex(null)} />}
  </article>}</ProjectPageShell>;
}