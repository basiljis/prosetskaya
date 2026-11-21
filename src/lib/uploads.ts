import { supabase } from "@/integrations/supabase/client";
import { optimizeImage } from "@/lib/image-optimize";

/** Optimizes, then uploads an image to the private artworks bucket and returns a long-lived link for public display. */
export async function uploadImage(file: File, folder: string): Promise<{ url: string; width: number; height: number }> {
  const img = await optimizeImage(file);
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${img.ext}`;
  const { error } = await supabase.storage.from("artworks").upload(path, img.blob, { contentType: img.type, cacheControl: "31536000" });
  if (error) throw new Error("Не удалось загрузить изображение.");
  const { data, error: e2 } = await supabase.storage.from("artworks").createSignedUrl(path, 60 * 60 * 24 * 365 * 50);
  if (e2 || !data) throw new Error("Не удалось получить ссылку на изображение.");
  return { url: data.signedUrl, width: img.width, height: img.height };
}
