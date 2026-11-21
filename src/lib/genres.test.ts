import { describe, expect, it } from "vitest";
import { filterByTaxonomy } from "@/lib/genres";
import { hangLiftCm } from "@/lib/boutique";

describe("genre/style filter", () => {
  const works = [{ id: "a", genre: "landscape", style: "realism" }, { id: "b", genre: "portrait", style: "realism" }, { id: "c", genre: "landscape", style: "naive" }];
  it("combines genre and style", () => { expect(filterByTaxonomy(works, "landscape", "realism").map((w) => w.id)).toEqual(["a"]); });
  it("multi-select matches any chosen genre", () => { expect(filterByTaxonomy(works, ["landscape", "portrait"], []).length).toBeGreaterThan(filterByTaxonomy(works, ["landscape"], []).length); });
  it("all shows everything", () => { expect(filterByTaxonomy(works, "all", "all")).toHaveLength(3); });
});
describe("interior hanging", () => {
  it("lifts small works, not large ones", () => { expect(hangLiftCm(30)).toBe(20); expect(hangLiftCm(10)).toBe(24); expect(hangLiftCm(100)).toBe(0); });
});
