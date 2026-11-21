/** Hang artworks along two facing gallery walls, in metres. Pure, no three.js. */
export type Hung = { id: string; side: -1 | 1; z: number; w: number; h: number };
export const WALL_X = 3.2, EYE = 1.55, GAP = 1.4, START = -2;

/** Longest side in metres from a "40 × 50" size string; falls back to 0.9 m. */
export function longestSideM(size: string): number {
  const n = (size.match(/\d+(?:[.,]\d+)?/g) ?? []).map((x) => Number(x.replace(",", ".")));
  const max = n.length ? Math.max(...n) : 0;
  return max >= 15 && max <= 600 ? max / 100 : 0.9;
}

export function hang(works: readonly { id: string; size: string; width: number; height: number }[]): Hung[] {
  const z: Record<number, number> = { [-1]: START, 1: START };
  return works.map((w, i) => {
    const side = (i % 2 === 0 ? -1 : 1) as -1 | 1;
    const long = Math.min(2.4, Math.max(0.5, longestSideM(w.size)));
    const r = w.width && w.height ? w.width / w.height : 1;
    const width = r >= 1 ? long : long * r, height = r >= 1 ? long / r : long;
    const at = z[side]! - width / 2;
    z[side] = at - width / 2 - GAP;
    return { id: w.id, side, z: at, w: width, h: height };
  });
}
