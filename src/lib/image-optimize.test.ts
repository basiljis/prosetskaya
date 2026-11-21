import { describe, expect, it } from "vitest";
import { fitWithin } from "./image-optimize";
describe("upload resizing", () => {
  it("scales the longest side down to 2000 px", () => { expect(fitWithin(4032, 3024)).toEqual({ width: 2000, height: 1500 }); });
  it("never enlarges small images", () => { expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 }); });
});
