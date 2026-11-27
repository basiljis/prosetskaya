export function yearOptions(works: readonly { year: string }[]): string[] {
  return [...new Set(works.map((w) => w.year.trim()).filter(Boolean))].sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
}
export function matchesYear(work: { year: string }, selected: readonly string[]) { return !selected.length || selected.includes(work.year.trim()); }
