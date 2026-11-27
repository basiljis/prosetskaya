import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/lib/backend/client";
import { SimplePage } from "@/components/simple-page";
import { useArtworks } from "@/hooks/use-artworks";
import { useFavorites } from "@/hooks/use-favorites";
import { FavoriteButton } from "@/components/favorite-button";
import { ArtworkViewer } from "@/components/artwork-viewer";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { methodLabel, rub, statusLabel } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [
    { title: "Личный кабинет — Юлия Просецкая" },
    { name: "description", content: "Заказы, статусы покупки, избранные картины и подписка в галерее Юлии Просецкой." },
    { property: "og:title", content: "Личный кабинет галереи Юлии Просецкой" },
    { property: "og:description", content: "Заказы, избранное и подписка на обновления художницы." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }), component: Account,
});

function Account() {
  const artworks = useArtworks();
  const fav = useFavorites();
  const liked = artworks.filter((w) => fav.ids.has(w.id));
  const [viewer, setViewer] = useState<number | null>(null);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const q = useQuery({ queryKey: ["account"], refetchInterval: 15_000, queryFn: async () => {
    const { data: u, error } = await supabase.auth.getUser();
    if (error || !u.user) throw new Error("Не удалось проверить вход.");
    const user = u.user;
    const [orders, admin, sub] = await Promise.all([
      supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }),
      supabase.from("subscribers").select("subscribed").eq("email", (user.email ?? "").toLowerCase()).maybeSingle(),
    ]);
    if (orders.error || admin.error || sub.error) throw new Error("Не удалось загрузить кабинет.");
    return { email: user.email, orders: orders.data ?? [], admin: !!admin.data, subscribed: !!sub.data?.subscribed };
  } });
  const data = q.data;
  const signOut = async () => { await qc.cancelQueries(); qc.clear(); await supabase.auth.signOut(); void navigate({ to: "/auth", replace: true }); };
  return <SimplePage title="Личный кабинет" kicker={data?.email ?? "Личный кабинет"} wide>
    <div className="mt-6 flex flex-wrap items-center gap-6 text-xs">{data?.admin && <Button asChild variant="editorial" className="px-0 text-xs"><Link to="/admin">Админ-панель</Link></Button>}<Button variant="editorial" onClick={signOut} className="px-0 text-xs">Выйти</Button></div>
    {q.isError && <p role="alert" className="mt-5 text-sm text-destructive">Не удалось загрузить кабинет. <Button variant="editorial" onClick={() => q.refetch()}>Повторить</Button></p>}
    <Tabs defaultValue="orders" className="mt-8">
      <TabsList className="grid h-auto w-full grid-cols-3 rounded-none border-b border-border bg-transparent p-0">
        <TabsTrigger value="orders" className="h-12 rounded-none text-xs sm:text-sm">Заказы ({data?.orders.length ?? 0})</TabsTrigger>
        <TabsTrigger value="favorites" className="h-12 rounded-none text-xs sm:text-sm">Избранное ({liked.length})</TabsTrigger>
        <TabsTrigger value="subscription" className="h-12 rounded-none text-xs sm:text-sm">Подписка</TabsTrigger>
      </TabsList>
      <TabsContent value="orders" className="mt-8">
        {q.isLoading && <p role="status" className="text-sm">Загрузка заказов…</p>}
        {data?.orders.length === 0 && <p className="text-sm text-muted-foreground">Заказов пока нет. <Link to="/" hash="works" className="underline">Перейти в галерею</Link></p>}
        <ul className="border-t border-border">{data?.orders.map((o) => { const w = artworks.find((a) => a.id === o.artwork_id); return <li key={o.id} className="grid grid-cols-[72px_minmax(0,1fr)] gap-5 border-b border-border py-5 md:grid-cols-[96px_minmax(0,1fr)_auto]">
          {w ? <img src={w.image} alt={o.artwork_title} className="aspect-square w-full object-contain" /> : <span />}
          <div><p className="font-display text-2xl">{o.artwork_title}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{methodLabel[o.method]} · {new Date(o.created_at).toLocaleDateString("ru-RU")} · {rub(o.amount)}</p></div>
          <div className="col-start-2 md:col-start-auto md:max-w-60 md:text-right"><p className="text-sm font-medium text-primary">{statusLabel[o.status] ?? o.status}</p><p className="mt-2 text-xs text-muted-foreground">Обновлён {new Date(o.updated_at).toLocaleString("ru-RU")}</p></div>
        </li>; })}</ul>
      </TabsContent>
      <TabsContent value="favorites" className="mt-8">
        {liked.length === 0 ? <p className="text-sm text-muted-foreground">В избранном пока нет картин.</p> : <ul className="grid grid-cols-2 gap-5 md:grid-cols-4">{liked.map((w, i) => <li key={w.id}>
          <Button variant="artwork" onClick={() => setViewer(i)} className="h-auto w-full p-0" title={`Открыть ${w.ru}`}><img src={w.image} alt={w.ru} loading="lazy" className="aspect-[4/5] w-full object-contain" /></Button>
          <div className="mt-2 flex items-start justify-between gap-2"><p className="text-sm">{w.ru}</p><FavoriteButton id={w.id} lang="ru" /></div><p className="text-xs text-muted-foreground">{[w.year, w.size].filter(Boolean).join(" · ")}</p>
        </li>)}</ul>}
      </TabsContent>
      <TabsContent value="subscription" className="mt-8"><h2 className="font-display text-3xl">Подписка</h2>
        <label className="mt-5 flex max-w-xl cursor-pointer items-start gap-3 text-sm"><Checkbox className="mt-0.5" checked={!!data?.subscribed} disabled={!data} onCheckedChange={async (v) => { const { error } = await supabase.rpc("set_my_subscription", { _on: v === true }); if (error) alert("Не удалось изменить подписку"); else void qc.invalidateQueries({ queryKey: ["account"] }); }} /><span>Получать письма о новых работах и выставках</span></label>
      </TabsContent>
    </Tabs>
    {viewer !== null && <ArtworkViewer works={liked} index={viewer} lang="ru" purchaseActions onChange={setViewer} onClose={() => setViewer(null)} />}
  </SimplePage>;
}
