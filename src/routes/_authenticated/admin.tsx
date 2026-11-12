import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SimplePage } from "@/components/simple-page";
import { artworks } from "@/lib/artworks";
import { methodLabel, rub, statusLabel } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [
    { title: "Админ-панель — Юлия Просецкая" },
    { name: "description", content: "Управление ценами, оплатой и заказами." },
    { property: "og:title", content: "Админ-панель" },
    { property: "og:description", content: "Управление сайтом." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: Admin,
});

const input = "w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground";

function Admin() {
  const qc = useQueryClient();
  const [note, setNote] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["admin"], queryFn: async () => {
    const { data: u } = await supabase.auth.getUser();
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: u.user!.id, _role: "admin" });
    if (!isAdmin) return null;
    const [s, p, pr, o] = await Promise.all([
      supabase.from("site_settings").select("*").eq("id", 1).single(),
      supabase.from("payment_settings").select("*").eq("id", 1).single(),
      supabase.from("artwork_prices").select("*"),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
    ]);
    return { settings: s.data!, pay: p.data!, prices: Object.fromEntries((pr.data ?? []).map((r) => [r.artwork_id, r.price])), orders: o.data ?? [] };
  } });
  const refresh = (m: string) => { setNote(m); qc.invalidateQueries({ queryKey: ["admin"] }); };
  if (isLoading) return <SimplePage title="Админ-панель"><p className="mt-8 text-sm">Загрузка…</p></SimplePage>;
  if (!data) return <SimplePage title="Нет доступа"><p className="mt-8 text-sm">Эта страница только для администратора. <Link to="/account" className="border-b border-foreground">Мои заказы</Link></p></SimplePage>;

  const toggle = async (key: "show_prices" | "online_payment_enabled", value: boolean) => {
    await supabase.from("site_settings").update(key === "show_prices" ? { show_prices: value } : { online_payment_enabled: value }).eq("id", 1); refresh("Сохранено");
  };
  const saveKassa = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    const secret = String(f.get("secret") ?? "").trim();
    await supabase.from("payment_settings").update({ yookassa_shop_id: String(f.get("shop") ?? "").trim().slice(0, 50), ...(secret ? { yookassa_secret_key: secret.slice(0, 200) } : {}), updated_at: new Date().toISOString() }).eq("id", 1);
    refresh("Данные ЮKassa сохранены");
  };
  const savePrice = async (id: string, v: string) => {
    const n = v.trim() === "" ? null : Math.max(0, Math.round(Number(v.replace(/\s/g, ""))));
    if (n !== null && Number.isNaN(n)) return;
    await supabase.from("artwork_prices").upsert({ artwork_id: id, price: n, updated_at: new Date().toISOString() }); refresh("Цена сохранена");
  };
  const setStatus = async (id: string, status: string) => { await supabase.from("orders").update({ status }).eq("id", id); refresh("Статус заказа обновлён"); };
  const webhook = typeof window !== "undefined" ? `${window.location.origin}/api/public/yookassa` : "";

  return (
    <SimplePage title="Админ-панель" kicker="Управление сайтом" wide>
      {note && <p className="mt-4 text-xs text-primary">{note}</p>}
      <section className="mt-10 grid gap-8 border-t border-border pt-8 md:grid-cols-2">
        <div><h2 className="font-display text-2xl">Показ на сайте</h2>
          <label className="mt-5 flex items-center gap-3 text-sm"><input type="checkbox" checked={data.settings.show_prices} onChange={(e) => toggle("show_prices", e.target.checked)} />Показывать цены посетителям</label>
          <label className="mt-3 flex items-center gap-3 text-sm"><input type="checkbox" checked={data.settings.online_payment_enabled} onChange={(e) => toggle("online_payment_enabled", e.target.checked)} />Включить онлайн-оплату (ЮKassa)</label>
          <p className="mt-3 text-[11px] leading-5 text-muted-foreground">Онлайн-оплата доступна только для работ с указанной ценой.</p>
        </div>
        <form onSubmit={saveKassa} className="space-y-4"><h2 className="font-display text-2xl">ЮKassa</h2>
          <label className="block text-[10px] uppercase text-muted-foreground">shopId<input name="shop" defaultValue={data.pay.yookassa_shop_id} className={input} /></label>
          <label className="block text-[10px] uppercase text-muted-foreground">Секретный ключ {data.pay.yookassa_secret_key ? "(сохранён — оставьте пустым, чтобы не менять)" : "(не указан)"}<input name="secret" type="password" autoComplete="off" className={input} /></label>
          <p className="text-[11px] leading-5 text-muted-foreground">В личном кабинете ЮKassa укажите адрес для уведомлений: <span className="break-all text-foreground">{webhook}</span> (события payment.succeeded и payment.canceled).</p>
          <button className="bg-foreground px-6 py-2.5 text-xs uppercase tracking-[0.15em] text-background">Сохранить</button>
        </form>
      </section>
      <section className="mt-12 border-t border-border pt-8"><h2 className="font-display text-2xl">Цены, ₽</h2>
        <ul className="mt-4 grid gap-x-8 md:grid-cols-2">{artworks.map((w) => <li key={w.id} className="grid grid-cols-[1fr_120px] items-center gap-4 border-b border-border py-2 text-sm"><span>{w.ru} <span className="text-[11px] text-muted-foreground">{w.size}</span></span><input defaultValue={data.prices[w.id] ?? ""} onBlur={(e) => savePrice(w.id, e.target.value)} inputMode="numeric" placeholder="по запросу" className={input + " text-right"} /></li>)}</ul>
      </section>
      <section className="mt-12 border-t border-border pt-8"><h2 className="font-display text-2xl">Заказы</h2>
        {data.orders.length === 0 && <p className="mt-4 text-sm text-muted-foreground">Заказов пока нет.</p>}
        <ul className="mt-4">{data.orders.map((o) => <li key={o.id} className="grid gap-3 border-b border-border py-4 text-sm md:grid-cols-[1.2fr_1.5fr_200px]">
          <div><p className="font-display text-xl">{o.artwork_title}</p><p className="text-[11px] text-muted-foreground">{new Date(o.created_at).toLocaleString("ru-RU")} · {methodLabel[o.method]} · {rub(o.amount)}</p></div>
          <div className="text-xs leading-5">{o.customer_name}{o.company && ` · ${o.company}`}<br />{o.customer_phone} · {o.customer_email}{o.comment && <><br /><span className="text-muted-foreground">{o.comment}</span></>}</div>
          <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="h-9 border border-border bg-background px-2 text-xs">{Object.entries(statusLabel).map(([k, v]) => <option key={k} value={k}>{v.split(" — ")[0]}</option>)}</select>
        </li>)}</ul>
      </section>
    </SimplePage>
  );
}
