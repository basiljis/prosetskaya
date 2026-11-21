import fallback from "@/data/cv.json";
type Section = Omit<(typeof fallback)["sections"][number], "itemsEn"> & { itemsEn?: string[] };
export type Cv = Omit<typeof fallback, "sections"> & { sections: Section[] };
/** Admin-edited CV from settings, falling back to the bundled CV. */
export function resolveCv(value: unknown): Cv {
  const v = value as Partial<Cv> | null;
  return v && typeof v === "object" && Array.isArray(v.sections) ? { ...fallback, ...v, sections: (v.sections as Section[]).map((s) => ({ ...s, itemsEn: s.itemsEn?.length ? s.itemsEn : fallback.sections.find((f) => f.ru === s.ru)?.itemsEn })) } as Cv : fallback;
}
