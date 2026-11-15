import { queryOptions } from "@tanstack/react-query";
import { loadPublicProjects } from "@/lib/projects.functions";

export const publicProjectsOptions = queryOptions({
  queryKey: ["public-projects"], queryFn: () => loadPublicProjects(), staleTime: 30_000,
});