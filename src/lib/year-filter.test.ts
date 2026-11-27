import { expect, it } from "vitest";
import { matchesYear, yearOptions } from "./year-filter";
it("filters artworks by any selected year", () => { expect(matchesYear({ year: "2020" }, ["2020", "2023"])).toBe(true); expect(matchesYear({ year: "2021" }, ["2020", "2023"])).toBe(false); expect(matchesYear({ year: "" }, [])).toBe(true); });
it("lists unique nonempty years newest first", () => { expect(yearOptions([{ year: "2020" }, { year: "2023" }, { year: "2020" }, { year: "" }])).toEqual(["2023", "2020"]); });
