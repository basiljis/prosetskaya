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
export function filterByTaxonomy<T extends { genre?: string | null; style?: string | null }>(works: readonly T[], genre: string | readonly string[], style: string | readonly string[]): readonly T[] {
  const set = (v: string | readonly string[]) => { const a = typeof v === "string" ? (v === "all" ? [] : [v]) : v; return new Set(a); };
  const g = set(genre), st = set(style);
  return works.filter((w) => (!g.size || g.has(w.genre ?? "")) && (!st.size || st.has(w.style ?? "")));
}

/** Admin-editable dictionary entry (genre or style). */
export type Term = { key: string; ru: string; en: string; hidden: boolean };

/** Saved dictionary order/labels first, then built-in terms the admin has not saved yet. */
export function resolveTerms(value: unknown, defaults: Record<string, { ru: string; en: string }>): Term[] {
  const saved = (Array.isArray(value) ? value : []).filter((t): t is Term => !!t && typeof t.key === "string" && t.key.trim() !== "");
  const keys = new Set(saved.map((t) => t.key));
  return [
    ...saved.map((t) => ({ key: t.key, ru: t.ru?.trim() || defaults[t.key]?.ru || t.key, en: t.en?.trim() || defaults[t.key]?.en || t.ru || t.key, hidden: !!t.hidden })),
    ...Object.entries(defaults).filter(([k]) => !keys.has(k)).map(([key, v]) => ({ key, ...v, hidden: false })),
  ];
}

export function termKey(label: string) {
  const map: Record<string, string> = { а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"e",ж:"zh",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"h",ц:"c",ч:"ch",ш:"sh",щ:"sch",ы:"y",э:"e",ю:"yu",я:"ya" };
  return label.toLowerCase().split("").map((c) => map[c] ?? c).join("").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `term-${Date.now()}`;
}
