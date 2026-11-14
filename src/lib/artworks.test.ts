import { describe, expect, it } from "vitest";
import catalogue from "@/data/artworks.json";
import { artworks, canPurchaseArtwork } from "./artworks";
import { filterArtworks } from "./gallery-navigation";

describe("Complete source catalogue", () => {
  it("includes every image from all fourteen source collections, not only the selected works", () => {
    expect(artworks).toHaveLength(428);
    expect(new Set(artworks.map((work) => work.id)).size).toBe(428);
    expect(filterArtworks(artworks, "painting")).toHaveLength(63);
    expect(filterArtworks(artworks, "landscape")).toHaveLength(180);
    expect(filterArtworks(artworks, "digital")).toHaveLength(51);
    expect(filterArtworks(artworks, "graphics")).toHaveLength(30);
    expect(filterArtworks(artworks, "fluorescent")).toHaveLength(5);
    expect(filterArtworks(artworks, "studies")).toHaveLength(56);
    expect(filterArtworks(artworks, "illustrations")).toHaveLength(13);
    expect(filterArtworks(artworks, "logos")).toHaveLength(8);
    expect(filterArtworks(artworks, "projects")).toHaveLength(47);
    expect(new Set(catalogue.flatMap((work) => work.sources.map((source) => source.page))).size).toBe(14);
    expect(artworks.every((work) => work.image.startsWith("/__l5e/assets-v1/"))).toBe(true);
  });
  it("preserves the existing identifiers used by prices, orders and the first-screen selection", () => {
    expect(artworks.slice(0, 17).map((work) => work.id)).toEqual(["reflection", "my-world", "anniversary-bouquet", "bright-soul", "girl-flamingo", "dancer", "daisies", "silence", "cape-fiolent", "crimean-vineyards", "ural-river", "time", "pink-rain", "flower-world", "suvorovsky-lane", "bakhchisaray", "fluorescent-5"]);
  });
  it("does not present commissioned project photos or works already held in collections as available stock", () => {
    expect(canPurchaseArtwork({ catalogueOnly: true })).toBe(false);
    expect(canPurchaseArtwork({ sourceAvailability: "sold" })).toBe(false);
    expect(canPurchaseArtwork({ sourceAvailability: "private" })).toBe(false);
    expect(canPurchaseArtwork({ sourceAvailability: "museum" })).toBe(false);
    expect(canPurchaseArtwork({})).toBe(true);
  });
});