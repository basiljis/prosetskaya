import { categories, type Category } from "@/lib/artworks";
import { copy } from "@/lib/gallery-copy";

export type Direction = { key: Category; ru: string; en: string; hidden: boolean };
/** Projects live in their own homepage block, so they are never a collection direction. */
export const directionKeys: Category[] = categories.filter((key) => key !== "projects");

export function resolveDirections(value: unknown): Direction[] {
  const saved = Array.isArray(value) ? (value as Partial<Direction>[]) : [];
  const byKey = new Map(saved.filter((d) => d && directionKeys.includes(d.key as Category)).map((d) => [d.key as Category, d]));
  const order = [...saved.map((d) => d?.key as Category).filter((k) => byKey.has(k)), ...directionKeys.filter((k) => !byKey.has(k))];
  return [...new Set(order)].map((key) => {
    const d = byKey.get(key);
    return { key, ru: d?.ru?.trim() || copy.ru.categories[key], en: d?.en?.trim() || copy.en.categories[key], hidden: key === "all" ? false : !!d?.hidden };
  });
}

export function isProjectWork(work: { category: string; categories?: readonly string[] }) {
  return work.category === "projects" || !!work.categories?.includes("projects");
}

export function pageCount(total: number, size: number) { return Math.max(1, Math.ceil(total / size)); }
export function pageSlice<T>(items: readonly T[], page: number, size: number): readonly T[] {
  const p = Math.min(Math.max(1, page), pageCount(items.length, size));
  return items.slice((p - 1) * size, p * size);
}
export function searchWorks<T extends { ru: string; en: string; year?: string | number; mediumRu?: string }>(works: readonly T[], q: string): readonly T[] {
  const s = q.trim().toLowerCase();
  return s ? works.filter((w) => [w.ru, w.en, String(w.year ?? ""), w.mediumRu ?? ""].some((v) => v.toLowerCase().includes(s))) : works;
}
