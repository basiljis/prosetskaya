import { describe, expect, it } from "vitest";
import { collectionMenuPosition } from "./collection-layout";

describe("Collection menu placement", () => {
  it("uses the top bar by default", () => {
    expect(collectionMenuPosition(undefined)).toBe("top");
    expect(collectionMenuPosition("top")).toBe("top");
  });
  it("supports the left sidebar", () => {
    expect(collectionMenuPosition("left")).toBe("left");
  });
});