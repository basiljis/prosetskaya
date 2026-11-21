import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Signed-in visitor's liked artworks; null user means favourites need sign-in. */
export function useFavorites() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["favorites"], queryFn: async () => {
    const { data: s } = await supabase.auth.getSession();
    if (!s.session) return { signedIn: false, ids: new Set<string>() };
    const { data } = await supabase.from("favorites").select("artwork_id").order("created_at", { ascending: false });
    return { signedIn: true, ids: new Set((data ?? []).map((r) => r.artwork_id)) };
  }, staleTime: 60_000 });
  const toggle = async (id: string) => {
    if (!q.data?.signedIn) { window.location.href = "/auth"; return; }
    const has = q.data.ids.has(id);
    const next = new Set(q.data.ids); if (has) next.delete(id); else next.add(id);
    qc.setQueryData(["favorites"], { signedIn: true, ids: next });
    const { error } = has ? await supabase.from("favorites").delete().eq("artwork_id", id) : await supabase.from("favorites").insert({ artwork_id: id });
    if (error) void qc.invalidateQueries({ queryKey: ["favorites"] });
  };
  return { ids: q.data?.ids ?? new Set<string>(), signedIn: !!q.data?.signedIn, toggle };
}
