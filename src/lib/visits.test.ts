import { describe, expect, it } from "vitest";
import { summarize, deviceOf, refHost } from "@/lib/visits";

describe("visit statistics", () => {
  const now = new Date("2026-11-21T12:00:00");
  const v = (path: string, id: string, at: string, referrer = "") => ({ path, referrer, device: "desktop", visitor_id: id, created_at: new Date(at).toISOString() });
  const visits = [v("/", "a", "2026-11-21T10:00:00"), v("/cv", "a", "2026-11-21T10:05:00"), v("/", "b", "2026-11-20T09:00:00", "https://www.google.com/x"), v("/", "c", "2026-10-01T09:00:00")];
  it("counts views and unique visitors in the period", () => { const s = summarize(visits, 7, now); expect(s.views).toBe(3); expect(s.visitors).toBe(2); });
  it("counts a browser once per day despite several page views", () => { const s = summarize(visits, 1, now); expect(s.dailyVisitors.map((d) => d[1])).toEqual([1]); expect(s.daily.map((d) => d[1])).toEqual([2]); });
  it("excludes older visits", () => { expect(summarize(visits, 1, now).views).toBe(2); });
  it("groups referrers by site", () => { expect(refHost("https://www.google.com/x")).toBe("google.com"); expect(refHost("")).toBe("Прямой заход"); });
  it("classifies devices by width", () => { expect(deviceOf(400)).toBe("mobile"); expect(deviceOf(800)).toBe("tablet"); expect(deviceOf(1400)).toBe("desktop"); });
});
