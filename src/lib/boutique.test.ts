import { describe, expect, it } from "vitest";
import { artworkSizeCm, availability } from "./boutique";

describe("boutique", () => {
  it("scales a landscape work by its longest side", () => {
    expect(artworkSizeCm({ size: "50 × 70", width: 1400, height: 1000 })).toEqual({ w: 70, h: 50 });
  });
  it("defaults to 60 cm when size is unknown", () => {
    expect(artworkSizeCm({ size: "", width: 1000, height: 1000 })).toEqual({ w: 60, h: 60 });
  });
  it("offers digital works as prints", () => {
    expect(availability({ category: "digital" })).toBe("print");
    expect(availability({ category: "painting" })).toBe("original");
  });
});
