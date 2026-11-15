import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { artworks as fallback, type Artwork } from "@/lib/artworks";
import { rowToArtwork, type ArtworkRow } from "@/lib/artwork-rows";

/** Gallery catalogue from the database; the bundled catalogue is shown until it loads. */
export function useArtworks(): readonly Artwork[] {
  const { data } = useQuery({
    queryKey: ["artworks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("artworks").select("*").eq("hidden", false).order("sort_order");
      if (error) throw error;
      return (data as ArtworkRow[]).map(rowToArtwork);
    },
    staleTime: 60_000,
  });
  return data && data.length ? data : fallback;
}
