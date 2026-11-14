export function nextArtworkIndex(index: number, direction: number, length: number): number {
  if (length <= 0) return 0;
  return ((index + direction) % length + length) % length;
}

export function filterArtworks<T extends { category: string; categories?: readonly string[] }>(works: readonly T[], category: string): readonly T[] {
  return category === "all" ? works : works.filter((work) => work.category === category || work.categories?.includes(category));
}