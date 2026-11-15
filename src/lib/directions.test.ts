import { describe, expect, it } from "vitest";
import { pageCount, pageSlice, resolveDirections } from "@/lib/directions";

describe("directions", () => {
  it("never offers projects as a direction", () => expect(resolveDirections([]).map((d) => d.key)).not.toContain("projects"));
  it("applies saved order, names and hiding", () => {
    const d = resolveDirections([{ key: "graphics", ru: "Рисунки", hidden: true }]);
    expect(d[0]).toMatchObject({ key: "graphics", ru: "Рисунки", hidden: true });
  });
  it("cannot hide all works", () => expect(resolveDirections([{ key: "all", hidden: true }])[0]!.hidden).toBe(false));
});
describe("pagination", () => {
  it("splits 50 into 3 pages of 24", () => { expect(pageCount(50, 24)).toBe(3); expect(pageSlice(Array.from({ length: 50 }, (_, i) => i), 3, 24)).toEqual([48, 49]); });
});
