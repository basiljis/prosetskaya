import type { Artwork, Lang } from "@/lib/artworks";

export interface Project {
  id: string; title_ru: string; title_en: string; description_ru: string; description_en: string;
  year: string; kind: "painting" | "photo"; interior_enabled: boolean; source: string;
  cover_artwork_id: string | null; sort_order: number;
}

export const projectIntro = {
  ru: "Юлия Просецкая создаёт масштабные художественные решения для бизнеса, общественных пространств и киноиндустрии.\n\nКино и декорации. Работает на съёмочных площадках и в павильонах как художник-декоратор: создаёт художественные декорации, исторические и тематические росписи, живописный реквизит. В портфолио — проекты для крупных киностудий, включая работу для сериала «Годунов».\n\nИнтерьеры и архитектура. Выполняет роспись стен и создаёт серии картин для ресторанов, гостиниц и спортивных комплексов («Лужники», «Таврида»).\n\nОткрыта к сотрудничеству с киностудиями, продакшнами, архитекторами и корпоративными заказчиками. Оставьте заявку, чтобы обсудить сценарий, ТЗ или концепцию вашего проекта.",
  en: "Yulia Prosetskaya creates large-scale artistic solutions for business, public spaces and the film industry.\n\nFilm and set design. She works on film sets and in studio pavilions as a set decorator: painted sets, historical and themed murals, painted props. Her portfolio includes projects for major film studios, among them the TV series “Godunov”.\n\nInteriors and architecture. Murals and painting series for restaurants, hotels and sports complexes (Luzhniki, Tavrida).\n\nOpen to collaboration with film studios, production companies, architects and corporate clients. Get in touch to discuss your script, brief or concept.",
};
/** Projects shown under the «Кино и декорации» tag. */
export const cinemaProjectIds = ["godunov"];
/** Direction groups for the special-projects filter; projects not listed fall into "public". */
export const projectGroups = [
  { id: "murals", ru: "Роспись стен и потолков", en: "Wall & ceiling murals", ids: ["murals"] },
  { id: "cinema", ru: "Кино и декорации", en: "Film & set design", ids: cinemaProjectIds },
  { id: "public", ru: "Общественные пространства", en: "Public spaces", ids: ["luzhniki", "hotels", "tavrida", "individual", "other-projects"] },
  { id: "graphics", ru: "Графика и дизайн", en: "Graphics & design", ids: ["logos", "illustration-projects"] },
] as const;
export function projectGroupOf(id: string) {
  return projectGroups.find((g) => (g.ids as readonly string[]).includes(id))?.id ?? "public";
}

/** The homepage highlights major commissions; the full catalogue retains every project. */
export function projectsForDisplay(projects: readonly Project[], fullCatalogue = false) {
  return fullCatalogue ? projects : projects.filter((p) => !["logos", "illustration-projects", "other-projects"].includes(p.id));
}

const sources = ["dlya-sportkompleksa", "dlya-seti-gostinic", "razrabotka-eskiza-dlya-proekta-tavrida", "individualnye-proekty", "proekty", "illyustracii", "razrabotka-logotipov"];
const names = [
  ["luzhniki", "Арт-проект «Лужники»", "Luzhniki art project"],
  ["hotels", "Серия для сети гостиниц", "Hotel chain series"],
  ["tavrida", "Эскиз для проекта «Таврида»", "Sketch for the Tavrida project"],
  ["individual", "Индивидуальные проекты", "Individual projects"],
  ["other-projects", "Другие спецпроекты", "Other special projects"],
  ["illustration-projects", "Иллюстрации · спецпроекты", "Illustration projects"],
  ["logos", "Разработка логотипов", "Logo design"],
];
export const fallbackProjects: readonly Project[] = names.map(([id = "", title_ru = "", title_en = ""], i) => ({
  id, title_ru, title_en, description_ru: i === 2 ? "Эскиз для проекта «Таврида» был разработан Просецкой Юлией, в дальнейшем воспроизведён на 100 кв. м за 1 час. В выполнении работы приняли участие 300 человек. Данная картина была занесена в Книгу рекордов России." : title_ru,
  description_en: title_en, year: i === 0 ? "2021" : "", kind: i === 1 || i === 4 ? "photo" : "painting",
  interior_enabled: i !== 1 && i !== 4 && i !== 6, source: `https://prosetskaya.ru/${sources[i]}`, cover_artwork_id: null, sort_order: i,
}));

export function projectTitle(project: Project, lang: Lang) { return lang === "ru" ? project.title_ru : project.title_en || project.title_ru; }
export function projectDescription(project: Project, lang: Lang) { return (lang === "ru" ? project.description_ru : project.description_en || project.description_ru).replace(/\\n/g, "\n"); }

export function projectForWork(work: Pick<Artwork, "projectId" | "source" | "category" | "categories">, projects: readonly Project[]) {
  if (work.projectId !== undefined) return projects.find((p) => p.id === work.projectId);
  if (!isProjectCategory(work)) return undefined;
  return projects.find((p) => p.source === work.source);
}

export function worksForProject(works: readonly Artwork[], project: Project): readonly Artwork[] {
  return works.filter((w) => w.projectId !== undefined ? w.projectId === project.id : isProjectCategory(w) && w.source === project.source);
}

export function canPreviewInRoom(work: Artwork, projects: readonly Project[] = fallbackProjects) {
  if (typeof work.interiorEnabled === "boolean") return work.interiorEnabled;
  const project = projectForWork(work, projects);
  return project ? project.interior_enabled : true;
}

export function projectCover(project: Project, works: readonly Artwork[]) {
  const list = worksForProject(works, project);
  return list.find((w) => w.id === project.cover_artwork_id) ?? list[0];
}
/** Logos are presented as a special project, not as a collection direction. */
export function isProjectCategory(work: Pick<Artwork, "category" | "categories">) {
  return ["projects", "logos"].some((c) => work.category === c || work.categories?.includes(c as Artwork["category"]));
}
