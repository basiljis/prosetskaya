import fallback from "@/data/cv.json";
export type Cv = typeof fallback;
/** Admin-edited CV from settings, falling back to the bundled CV. */
export function resolveCv(value: unknown): Cv {
  const v = value as Partial<Cv> | null;
  return v && typeof v === "object" && Array.isArray(v.sections) ? { ...fallback, ...v } as Cv : fallback;
}
