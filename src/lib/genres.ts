import type { Lang } from "@/lib/artworks";

/** Fixed genre and style (направление) vocabularies stored on each artwork. */
export const genres = {
  landscape: { ru: "Пейзаж", en: "Landscape" }, portrait: { ru: "Портрет", en: "Portrait" },
  "still-life": { ru: "Натюрморт", en: "Still life" }, "genre-scene": { ru: "Жанровая сцена", en: "Genre scene" },
  animal: { ru: "Анималистика", en: "Animals" }, architecture: { ru: "Архитектура", en: "Architecture" },
  fantasy: { ru: "Фантазийный сюжет", en: "Fantasy" }, abstract: { ru: "Абстракция", en: "Abstract" },
} as const;
export const styles = {
  realism: { ru: "Реализм", en: "Realism" }, impressionism: { ru: "Импрессионизм", en: "Impressionism" },
  expressionism: { ru: "Экспрессионизм", en: "Expressionism" }, surrealism: { ru: "Сюрреализм", en: "Surrealism" },
  naive: { ru: "Наив", en: "Naive art" }, abstraction: { ru: "Абстракционизм", en: "Abstraction" },
  decorative: { ru: "Декоративизм", en: "Decorative" },
} as const;
export type Genre = keyof typeof genres;
export type Style = keyof typeof styles;
export function genreLabel(g: string | null | undefined, lang: Lang) { return g && g in genres ? genres[g as Genre][lang] : ""; }
export function styleLabel(s: string | null | undefined, lang: Lang) { return s && s in styles ? styles[s as Style][lang] : ""; }

/** Narrow works by genre/style; "all" disables a filter. */
export function filterByTaxonomy<T extends { genre?: string | null; style?: string | null }>(works: readonly T[], genre: string, style: string): readonly T[] {
  return works.filter((w) => (genre === "all" || w.genre === genre) && (style === "all" || w.style === style));
}
