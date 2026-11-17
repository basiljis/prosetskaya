import type { Artwork, Lang } from "@/lib/artworks";

export interface Project {
  id: string; title_ru: string; title_en: string; description_ru: string; description_en: string;
  year: string; kind: "painting" | "photo"; interior_enabled: boolean; source: string;
  cover_artwork_id: string | null; sort_order: number;
}

export const projectIntro = {
  ru: "Юлия Просецкая как художница известна не только в России, но и за её пределами. Работает с корпоративными клиентами, которые заказывают картины для интерьера ресторанов, гостиниц, спортивных комплексов. Занимается росписью стен: в числе известных проектов — работа специально для сериала о Борисе Годунове.\n\nЕсли вы желаете заказать авторскую картину, оставьте заявку для обсуждения деталей. Заказы отправляются по всей территории России и за границу при помощи транспортных компаний.",
  en: "Yulia Prosetskaya is known as an artist in Russia and abroad. She works with corporate clients on paintings for restaurant, hotel and sports-complex interiors. Her mural projects include work for a series about Boris Godunov.\n\nTo commission a painting, get in touch to discuss the details. Works can be shipped throughout Russia and internationally by transport companies.",
};

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
