import { describe, expect, it } from "vitest";
import { filterArtworks, nextArtworkIndex } from "./gallery-navigation";

describe("Artwork navigation", () => {
  it("wraps from the last artwork to the first", () => {
    expect(nextArtworkIndex(11, 1, 12)).toBe(0);
  });
  it("wraps from the first artwork to the last", () => {
    expect(nextArtworkIndex(0, -1, 12)).toBe(11);
  });
  it("shows only artworks from the selected practice", () => {
    const works = [{ id: 1, category: "painting" }, { id: 2, category: "landscape" }];
    expect(filterArtworks(works, "landscape")).toEqual([works[1]]);
    expect(filterArtworks(works, "all")).toEqual(works);
  });
});