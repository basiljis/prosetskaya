import { expect, it } from "vitest";
import { exhibitionPage, exhibitionPageCount } from "./exhibition-pages";
it("hangs at most 12 works but makes every selected work accessible", () => {
 const works = Array.from({ length: 29 }, (_, id) => id);
 expect(exhibitionPageCount(29)).toBe(3);
 expect(exhibitionPage(works, 0)).toHaveLength(12);
 expect(exhibitionPage(works, 1)).toHaveLength(12);
 expect(exhibitionPage(works, 2)).toHaveLength(5);
 expect([0, 1, 2].flatMap((p) => exhibitionPage(works, p))).toEqual(works);
});
