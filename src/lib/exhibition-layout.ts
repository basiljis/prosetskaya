/** Hang artworks around a finite gallery room (left, back and right walls), in metres. Pure, no three.js. */
export const EYE = 1.55, GAP = 1.2, MARGIN = 1.2, CEIL = 3.6;
/** Upper bound of works per exhibition — keeps texture memory and draw calls low on phones. */
export const EXHIBITION_LIMIT = 12;

export type Wall = "left" | "back" | "right";
export type Hung = { id: string; wall: Wall; x: number; z: number; rotY: number; nx: number; nz: number; w: number; h: number };
export type Room = { width: number; depth: number; hung: Hung[] };

/** Longest side in metres from a "40 × 50" size string; falls back to 0.9 m. */
export function longestSideM(size: string): number {
  const n = (size.match(/\d+(?:[.,]\d+)?/g) ?? []).map((x) => Number(x.replace(",", ".")));
  const max = n.length ? Math.max(...n) : 0;
  return max >= 15 && max <= 600 ? max / 100 : 0.9;
}

const span = (ws: number[]) => ws.reduce((a, b) => a + b, 0) + GAP * Math.max(0, ws.length - 1) + MARGIN * 2;

export function layoutRoom(works: readonly { id: string; size: string; width: number; height: number }[]): Room {
  const dims = works.slice(0, EXHIBITION_LIMIT).map((w) => {
    const long = Math.min(2.2, Math.max(0.5, longestSideM(w.size)));
    const r = w.width && w.height ? w.width / w.height : 1;
    return { id: w.id, w: r >= 1 ? long : long * r, h: Math.min(r >= 1 ? long / r : long, CEIL - 1.4) };
  });
  // Walk the room clockwise from the entrance: left wall, back wall, right wall.
  const n = dims.length, back = Math.max(1, Math.round(n / 3)), side = Math.ceil((n - back) / 2);
  const groups: Record<Wall, typeof dims> = { left: dims.slice(0, side), back: dims.slice(side, side + back), right: dims.slice(side + back) };
  const width = Math.max(7, span(groups.back.map((d) => d.w)));
  const depth = Math.max(8, span(groups.left.map((d) => d.w)), span(groups.right.map((d) => d.w))) + 2; // +2 m free space at entrance
  const hung: Hung[] = [];
  const place = (wall: Wall, list: typeof dims) => {
    const total = span(list.map((d) => d.w)) - MARGIN * 2;
    let t = -total / 2;
    for (const d of list) {
      const c = t + d.w / 2; t += d.w + GAP;
      if (wall === "back") hung.push({ ...d, wall, x: c, z: -depth, rotY: 0, nx: 0, nz: 1 });
      // Side walls run from the entrance (z=0) to the back (z=-depth); paintings centred on the inner part.
      if (wall === "left") hung.push({ ...d, wall, x: -width / 2, z: -depth / 2 - 1 + c, rotY: Math.PI / 2, nx: 1, nz: 0 });
      if (wall === "right") hung.push({ ...d, wall, x: width / 2, z: -depth / 2 - 1 - c, rotY: -Math.PI / 2, nx: -1, nz: 0 });
    }
  };
  place("left", groups.left); place("back", groups.back); place("right", groups.right);
  return { width, depth, hung };
}
