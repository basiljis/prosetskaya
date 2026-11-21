import { describe, expect, it } from "vitest";
import { EXHIBITION_LIMIT, layoutRoom, longestSideM } from "./exhibition-layout";
const w = (id: string) => ({ id, size: "100 × 100", width: 1, height: 1 });
describe("exhibition layout", () => {
  it("reads the longest side in metres", () => { expect(longestSideM("40 × 50")).toBe(0.5); expect(longestSideM("")).toBe(0.9); });
  it("never hangs more than the limit", () => {
    expect(layoutRoom(Array.from({ length: 30 }, (_, i) => w(`a${i}`))).hung).toHaveLength(EXHIBITION_LIMIT);
  });
  it("uses a closed room with three walls, works inside its bounds", () => {
    const r = layoutRoom(Array.from({ length: 9 }, (_, i) => w(`a${i}`)));
    expect(new Set(r.hung.map((h) => h.wall))).toEqual(new Set(["left", "back", "right"]));
    for (const h of r.hung) {
      expect(h.z).toBeLessThanOrEqual(0); expect(h.z).toBeGreaterThanOrEqual(-r.depth);
      expect(Math.abs(h.x)).toBeLessThanOrEqual(r.width / 2);
    }
  });
});
