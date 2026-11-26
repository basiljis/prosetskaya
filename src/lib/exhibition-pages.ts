import { EXHIBITION_LIMIT } from "@/lib/exhibition-layout";
export function exhibitionPage<T>(works: readonly T[], page: number) {
  return works.slice(Math.max(0, page) * EXHIBITION_LIMIT, (Math.max(0, page) + 1) * EXHIBITION_LIMIT);
}
export function exhibitionPageCount(count: number) { return Math.max(1, Math.ceil(count / EXHIBITION_LIMIT)); }
