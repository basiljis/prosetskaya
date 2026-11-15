import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { rowToArtwork } from "@/lib/artwork-rows";
import type { Project } from "@/lib/projects";

export const loadPublicProjects = createServerFn({ method: "GET" }).handler(async () => {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || process.env["SUPABASE_ANON_KEY"];
  if (!url || !key) throw new Error("Не удалось загрузить проекты.");
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
  const [projects, works] = await Promise.all([
    client.from("projects").select("*").order("sort_order"),
    client.from("artworks").select("*").eq("hidden", false).order("sort_order"),
  ]);
  if (projects.error || works.error) throw new Error("Не удалось загрузить проекты. Попробуйте ещё раз.");
  return { projects: projects.data as Project[], works: works.data.map(rowToArtwork) };
});