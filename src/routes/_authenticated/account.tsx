import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SimplePage } from "@/components/simple-page";
import { useArtworks } from "@/hooks/use-artworks";
import { useFavorites } from "@/hooks/use-favorites";
import { FavoriteButton } from "@/components/favorite-button";
import { methodLabel, rub, statusLabel } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [
    { title: "Мои заказы — Юлия Просецкая" },
    { name: "description", content: "Личный кабинет покупателя: заказанные картины и статус оплаты." },
    { property: "og:title", content: "Мои заказы" },
    { property: "og:description", content: "Заказанные картины и статус." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: Account,
});

function Account() {
  const artworks = useArtworks();
  const fav = useFavorites();
  const liked = artworks.filter((w) => fav.ids.has(w.id));
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ["account"], queryFn: async () => {
    const { data: u } = await supabase.auth.getUser();
    const [{ data: orders }, { data: admin }] = await Promise.all([
      supabase.from("orders").select("*").eq("user_id", u.user!.id).order("created_at", { ascending: false }),
      supabase.rpc("has_role", { _user_id: u.user!.id, _role: "admin" }),
    ]);
    return { email: u.user!.email, orders: orders ?? [], admin: !!admin };
  } });
  const signOut = async () => { await qc.cancelQueries(); qc.clear(); await supabase.auth.signOut(); navigate({ to: "/auth", replace: true }); };
  return (
    <SimplePage title="Личный кабинет" kicker={data?.email ?? "Личный кабинет"} wide>
      <div className="mt-6 flex flex-wrap gap-6 text-xs">{data?.admin && <Link to="/admin" className="border-b border-foreground">Админ-панель</Link>}<button onClick={signOut} className="border-b border-foreground">Выйти</button></div>
      <h2 className="mt-12 font-display text-3xl">Избранное <span className="font-sans text-sm text-muted-foreground">({liked.length})</span></h2>
      {liked.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Отмечайте понравившиеся работы сердечком в галерее — они появятся здесь.</p> :
      <ul className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4">{liked.map((w) => <li key={w.id} className="relative"><img src={w.image} alt={w.ru} loading="lazy" className="aspect-[4/5] w-full object-cover" /><FavoriteButton id={w.id} lang="ru" className="absolute right-2 top-2" /><p className="mt-2 text-sm">{w.ru}</p><p className="text-xs text-muted-foreground">{[w.year, w.size].filter(Boolean).join(" · ")}</p></li>)}</ul>}
      <h2 className="mt-12 font-display text-3xl">Заказы</h2>
      {data && data.orders.length === 0 && <p className="mt-12 text-sm text-muted-foreground">Заказов пока нет. <Link to="/" hash="works" className="border-b border-foreground">Перейти в галерею</Link></p>}
      <ul className="mt-10 border-t border-border">{data?.orders.map((o) => { const w = artworks.find((a) => a.id === o.artwork_id); return (
        <li key={o.id} className="grid grid-cols-[72px_1fr] gap-5 border-b border-border py-5 md:grid-cols-[96px_1fr_auto]">
          {w ? <img src={w.image} alt={o.artwork_title} className="aspect-square w-full object-cover" /> : <span />}
          <div><p className="font-display text-2xl">{o.artwork_title}</p><p className="mt-1 text-xs text-muted-foreground">{methodLabel[o.method]} · {new Date(o.created_at).toLocaleDateString("ru-RU")} · {rub(o.amount)}</p></div>
          <span className="col-start-2 text-xs md:col-start-auto md:text-right">{statusLabel[o.status]}</span>
        </li>); })}</ul>
    </SimplePage>
  );
}
