import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { collectionMenuPosition } from "@/lib/collection-layout";
import { resolveDirections } from "@/lib/directions";

export function useShop() {
  return useQuery({
    queryKey: ["shop"],
    queryFn: async () => {
      const [s, p, r] = await Promise.all([
        supabase.from("site_settings").select("show_prices, online_payment_enabled, collection_menu_position, collection_directions").eq("id", 1).single(),
        supabase.from("artwork_prices").select("artwork_id, price"),
        supabase.rpc("reserved_artworks"),
      ]);
      return {
        showPrices: !!s.data?.show_prices,
        online: !!s.data?.online_payment_enabled,
        collectionMenuPosition: collectionMenuPosition(s.data?.collection_menu_position),
        directions: resolveDirections(s.data?.collection_directions),
        prices: Object.fromEntries((p.data ?? []).map((x) => [x.artwork_id, x.price])) as Record<string, number | null>,
        reserved: new Set<string>((r.data as string[] | null) ?? []),
      };
    },
    staleTime: 30_000,
  });
}
