import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/backend/client";
import { fallbackProjects, type Project } from "@/lib/projects";

export function useProjects(): readonly Project[] {
  const { data } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").order("sort_order");
      if (error) throw error;
      return data as Project[];
    },
    staleTime: 60_000,
  });
  return data ?? fallbackProjects;
}