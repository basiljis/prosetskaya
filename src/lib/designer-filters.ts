import { artworkSizeCm } from "@/lib/boutique";
import type { Artwork } from "@/lib/artworks";
export type SizeRange = { minW: string; maxW: string; minH: string; maxH: string };
export const EMPTY_SIZE: SizeRange = { minW: "", maxW: "", minH: "", maxH: "" };
export function matchesDimensions(work: Pick<Artwork, "size" | "width" | "height">, range: SizeRange) {
  if (!Object.values(range).some(Boolean)) return true;
  if (!work.size.trim()) return false;
  const { w, h } = artworkSizeCm(work);
  return (!range.minW || w >= Number(range.minW)) && (!range.maxW || w <= Number(range.maxW)) && (!range.minH || h >= Number(range.minH)) && (!range.maxH || h <= Number(range.maxH));
}
export function calibrationScale(a: { x: number; y: number }, b: { x: number; y: number }, cm: number, photoWidth: number) {
  const pixels = Math.hypot(b.x - a.x, b.y - a.y) * photoWidth;
  return cm > 0 && pixels > 1 ? pixels / cm : null;
}
export const COLOR_OPTIONS = [
  { key: "red", ru: "Красные", en: "Red", swatch: "bg-art-red" }, { key: "orange", ru: "Оранжевые", en: "Orange", swatch: "bg-art-orange" },
  { key: "yellow", ru: "Жёлтые", en: "Yellow", swatch: "bg-art-yellow" }, { key: "green", ru: "Зелёные", en: "Green", swatch: "bg-art-green" },
  { key: "blue", ru: "Синие", en: "Blue", swatch: "bg-art-blue" }, { key: "violet", ru: "Фиолетовые", en: "Violet", swatch: "bg-art-violet" },
  { key: "pink", ru: "Розовые", en: "Pink", swatch: "bg-art-pink" }, { key: "neutral", ru: "Нейтральные", en: "Neutral", swatch: "bg-art-neutral" },
] as const;
