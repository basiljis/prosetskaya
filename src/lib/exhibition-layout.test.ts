import { describe, expect, it } from "vitest";
import { hang, longestSideM } from "./exhibition-layout";
describe("exhibition layout", () => {
  it("reads the longest side in metres", () => { expect(longestSideM("40 × 50")).toBe(0.5); expect(longestSideM("")).toBe(0.9); });
  it("alternates walls and keeps works apart", () => {
    const h = hang([{ id: "a", size: "100 × 100", width: 1, height: 1 }, { id: "b", size: "", width: 1, height: 1 }, { id: "c", size: "100 × 100", width: 1, height: 1 }]);
    expect(h.map((x) => x.side)).toEqual([-1, 1, -1]);
    expect(h[0]!.z - h[2]!.z).toBeCloseTo(1 + 1.4);
  });
});
