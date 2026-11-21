/** Longest side kept for uploaded artwork photos; larger images are scaled down proportionally. */
export const MAX_SIDE = 2000;
export const WEBP_QUALITY = 0.82;

export function fitWithin(width: number, height: number, max = MAX_SIDE): { width: number; height: number } {
  const k = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * k), height: Math.round(height * k) };
}

/** Resize to MAX_SIDE and re-encode as WebP in the browser; keeps the original when that is smaller. */
export async function optimizeImage(file: File): Promise<{ blob: Blob; ext: string; type: string; width: number; height: number }> {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const size = fitWithin(bmp.width, bmp.height);
  const canvas = document.createElement("canvas");
  canvas.width = size.width; canvas.height = size.height;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, size.width, size.height);
  bmp.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", WEBP_QUALITY));
  if (blob && blob.type === "image/webp" && (blob.size < file.size || size.width < 1)) return { blob, ext: "webp", type: "image/webp", ...size };
  return { blob: file, ext: file.name.split(".").pop()?.toLowerCase() || "jpg", type: file.type, ...size };
}
