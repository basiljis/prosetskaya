import catalogue from "@/data/artworks.json";
import { artworkImages } from "@/lib/artwork-assets";

export type Lang = "ru" | "en";
export type Category = "all" | "painting" | "landscape" | "digital" | "graphics" | "fluorescent" | "studies" | "illustrations" | "logos" | "projects";
export interface Artwork {
  id: string; image: string; source: string; ru: string; en: string;
  category: Exclude<Category, "all">; categories?: readonly Exclude<Category, "all">[];
  year: string; size: string; mediumRu: string; mediumEn: string; width: number; height: number;
  catalogueOnly?: boolean;
  sourceAvailability?: "sold" | "private" | "museum";
}

type CatalogueArtwork = Omit<Artwork, "image">;
export const artworks: readonly Artwork[] = (catalogue as readonly CatalogueArtwork[]).map((work) => {
  const image = artworkImages[work.id];
  if (!image) throw new Error(`Artwork image missing: ${work.id}`);
  return { ...work, image };
});

export const artist = {
  email: "prosetskaya.juliya@gmail.com",
  phone: "+7 (909) 156-56-40",
  phoneHref: "tel:+79091565640",
  secondaryPhone: "+7 (910) 510-10-61",
  telegram: "https://t.me/yuliya_prosetskaya",
  instagram: "https://www.instagram.com/yulia_prosetskaya/",
  whatsapp: "https://wa.me/79091565640",
  source: "https://prosetskaya.ru/",
} as const;

export const categories: readonly Category[] = ["all", "painting", "landscape", "digital", "graphics", "fluorescent", "studies", "illustrations", "logos", "projects"];
export const featuredIds = ["reflection", "my-world", "girl-flamingo"] as const;

export function canPurchaseArtwork(work: Pick<Artwork, "catalogueOnly" | "sourceAvailability">): boolean {
  return !work.catalogueOnly && !work.sourceAvailability;
}
