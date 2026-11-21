export type NewsItem = { id: string; kind: "work" | "exhibition" | "other"; title_ru: string; title_en: string; body_ru: string; body_en: string; image_url: string; event_date: string; published: boolean; created_at: string };
export const newsKind = { work: { ru: "Новая работа", en: "New work" }, exhibition: { ru: "Выставка", en: "Exhibition" }, other: { ru: "Новость", en: "News" } } as const;
