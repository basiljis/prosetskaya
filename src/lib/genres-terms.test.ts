import { describe, expect, it } from "vitest";
import { genres, resolveTerms, termKey } from "@/lib/genres";

describe("admin dictionaries", () => {
  it("keeps saved order and labels, appends unsaved built-ins", () => {
    const t = resolveTerms([{ key: "portrait", ru: "Портреты", en: "", hidden: true }, { key: "marine", ru: "Марина", en: "Seascape", hidden: false }], genres);
    expect(t[0]).toEqual({ key: "portrait", ru: "Портреты", en: "Portrait", hidden: true });
    expect(t[1]?.key).toBe("marine");
    expect(t.some((x) => x.key === "landscape")).toBe(true);
  });
  it("builds latin keys from Russian names", () => { expect(termKey("Марина")).toBe("marina"); });
});
