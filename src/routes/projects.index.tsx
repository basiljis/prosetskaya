import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProjectCatalogue } from "@/components/project-catalogue";
import { ProjectPageShell } from "@/components/project-page-shell";
import { ContactDialog } from "@/components/contact-dialog";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { publicProjectsOptions } from "@/lib/projects-query";
import { projectIntro } from "@/lib/projects";

export const Route = createFileRoute("/projects/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(publicProjectsOptions),
  head: () => ({ meta: [
    { title: "Спецпроекты — Юлия Просецкая" },
    { name: "description", content: "Арт-проект «Лужники», эскиз для «Тавриды», работы для гостиниц и индивидуальные проекты Юлии Просецкой." },
    { property: "og:title", content: "Спецпроекты — Юлия Просецкая" },
    { property: "og:description", content: "Живопись, росписи и авторские проекты для общественных и частных пространств." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { data } = useSuspenseQuery(publicProjectsOptions);
  return <ProjectPageShell>{(lang) => <section className="gallery-shell py-10 md:py-14">
    <p className="mb-4 text-xs uppercase text-primary">Юлия Просецкая / {lang === "ru" ? "Авторские проекты" : "Artist projects"}</p>
    <h1 className="section-heading font-display">{lang === "ru" ? "Спецпроекты" : "Special projects"}</h1>
    <div className="mt-7 grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"><div className="max-w-3xl whitespace-pre-line text-sm leading-7 text-muted-foreground">{projectIntro[lang]}</div><ContactDialog lang={lang}><Button variant="editorial" className="h-auto w-fit border-b border-foreground px-0 pb-2 text-xs">{lang === "ru" ? "Обсудить проект" : "Discuss a project"}<ArrowUpRight /></Button></ContactDialog></div>
    <ProjectCatalogue projects={data.projects} works={data.works} lang={lang} sticky={false} />
  </section>}</ProjectPageShell>;
}