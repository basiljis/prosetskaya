/** Aggregates raw page visits into the admin statistics summary. */
export type Visit = { path: string; referrer: string; device: string; visitor_id: string; created_at: string };

export function deviceOf(width: number): "mobile" | "tablet" | "desktop" {
  return width < 640 ? "mobile" : width < 1024 ? "tablet" : "desktop";
}

export function refHost(ref: string): string {
  if (!ref) return "Прямой заход";
  try { return new URL(ref).hostname.replace(/^www\./, ""); } catch { return "Прямой заход"; }
}

function top(map: Map<string, number>, n = 8) { return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n); }

export function summarize(visits: readonly Visit[], days: number, now = new Date()) {
  const since = new Date(now); since.setHours(0, 0, 0, 0); since.setDate(since.getDate() - (days - 1));
  const list = visits.filter((v) => new Date(v.created_at) >= since);
  const daily = new Map<string, number>();
  for (let i = 0; i < days; i++) { const d = new Date(since); d.setDate(d.getDate() + i); daily.set(d.toISOString().slice(0, 10), 0); }
  const uniqueDaily = new Map<string, Set<string>>();
  const pages = new Map<string, number>(), refs = new Map<string, number>(), devices = new Map<string, number>();
  for (const v of list) {
    const day = new Date(v.created_at); const key = new Date(day.getTime() - day.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    if (daily.has(key)) { daily.set(key, (daily.get(key) ?? 0) + 1); const ids = uniqueDaily.get(key) ?? new Set<string>(); ids.add(v.visitor_id); uniqueDaily.set(key, ids); }
    pages.set(v.path, (pages.get(v.path) ?? 0) + 1);
    const r = refHost(v.referrer); refs.set(r, (refs.get(r) ?? 0) + 1);
    devices.set(v.device, (devices.get(v.device) ?? 0) + 1);
  }
  return { views: list.length, visitors: new Set(list.map((v) => v.visitor_id)).size, daily: [...daily.entries()], dailyVisitors: [...daily.keys()].map((k): [string, number] => [k, uniqueDaily.get(k)?.size ?? 0]), pages: top(pages), refs: top(refs), devices: top(devices) };
}
