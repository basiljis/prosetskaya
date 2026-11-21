import { supabase } from "@/integrations/supabase/client";

/** Uploads an image to the private artworks bucket and returns a long-lived link for public display. */
export async function uploadImage(file: File, folder: string): Promise<{ url: string; width: number; height: number }> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("artworks").upload(path, file, { contentType: file.type });
  if (error) throw new Error("Не удалось загрузить изображение.");
  const { data, error: e2 } = await supabase.storage.from("artworks").createSignedUrl(path, 60 * 60 * 24 * 365 * 50);
  if (e2 || !data) throw new Error("Не удалось получить ссылку на изображение.");
  const size = await new Promise<{ width: number; height: number }>((res) => { const img = new Image(); img.onload = () => res({ width: img.naturalWidth, height: img.naturalHeight }); img.onerror = () => res({ width: 1000, height: 1000 }); img.src = URL.createObjectURL(file); });
  return { url: data.signedUrl, ...size };
}
