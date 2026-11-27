import { createServerFn } from "@tanstack/react-start";
import { rowToArtwork } from "@/lib/artwork-rows";
import type { Project } from "@/lib/projects";

export const loadPublicProjects = createServerFn({ method: "GET" }).handler(async () => {
  const { publicBackend } = await import("@/lib/backend/client.server");
  const client = publicBackend();
  const [projects, works] = await Promise.all([
    client.from("projects").select("*").order("sort_order"),
    client.from("artworks").select("*").eq("hidden", false).order("sort_order"),
  ]);
  if (projects.error || works.error) throw new Error("Не удалось загрузить проекты. Попробуйте ещё раз.");
  return { projects: projects.data as Project[], works: works.data.map(rowToArtwork) };
});