import type { Artwork } from "@/lib/artworks";

export interface ArtworkRow {
  id: string; title_ru: string; title_en: string; category: string; categories: string[];
  year: string; size: string; medium_ru: string; medium_en: string; image_url: string;
  width: number; height: number; catalogue_only: boolean; source_availability: string | null;
  source: string; sort_order: number; hidden: boolean;
}

/** Database row → gallery artwork shape used across the site. */
export function rowToArtwork(r: ArtworkRow): Artwork {
  const availability = r.source_availability === "sold" || r.source_availability === "private" || r.source_availability === "museum" ? r.source_availability : undefined;
  return {
    id: r.id, image: r.image_url, source: r.source, ru: r.title_ru, en: r.title_en || r.title_ru,
    category: r.category as Artwork["category"], categories: (r.categories.length ? r.categories : [r.category]) as Artwork["categories"],
    year: r.year, size: r.size, mediumRu: r.medium_ru, mediumEn: r.medium_en || r.medium_ru,
    width: r.width, height: r.height, catalogueOnly: r.catalogue_only || undefined, sourceAvailability: availability,
  };
}
