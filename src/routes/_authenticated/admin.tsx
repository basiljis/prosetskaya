import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ArrowUpRight, CheckCircle2, CreditCard, Image, Loader2, LockKeyhole, Package, PanelLeft, PanelTop, RefreshCw, Save, Search, Settings } from "lucide-react";
import { SimplePage } from "@/components/simple-page";
import { AdminPriceEditor } from "@/components/admin-price-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { artworks } from "@/lib/artworks";
import { methodLabel, rub, statusLabel } from "@/lib/shop";
import { loadAdminData, saveAdminOrderStatus, saveAdminPayment, saveAdminSetting, saveCollectionMenuPosition } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [
    { title: "Админ-панель — Юлия Просецкая" },
    { name: "description", content: "Управление ценами, оплатой и заказами." },
    { property: "og:title", content: "Админ-панель — Юлия Просецкая" },
    { property: "og:description", content: "Управление ценами картин, заказами и оплатой в галерее Юлии Просецкой." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: Admin,
});

function Admin() {
  const qc = useQueryClient();
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const [webhook, setWebhook] = useState("");
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["admin"], queryFn: loadAdminData, retry: 1 });
  useEffect(() => { setWebhook(`${window.location.origin}/api/public/yookassa`); }, []);
  const refresh = (message: string) => {
    setNote(message); setError("");
    void Promise.all(["admin", "shop", "account"].map((key) => qc.invalidateQueries({ queryKey: [key] })));
  };
  const run = async (action: () => Promise<void>, message: string) => {
    setBusy(true); setNote(""); setError("");
    try { await action(); refresh(message); }
    catch (err) { setError(err instanceof Error ? err.message : "Изменения не сохранены."); }
    finally { setBusy(false); }
  };
  const saveKassa = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    await run(async () => { await saveAdminPayment(String(values.get("shop") ?? ""), String(values.get("secret") ?? "")); form.reset(); }, "Данные ЮKassa сохранены");
  };
  if (isLoading) return <SimplePage title="Админ-панель" wide><p role="status" className="mt-10 flex items-center gap-3 text-sm text-muted-foreground"><Loader2 className="size-5 animate-spin" />Загружаем настройки…</p></SimplePage>;
  if (isError) return <SimplePage title="Админ-панель" wide><p role="alert" className="mt-8 text-sm text-destructive">Не удалось загрузить настройки.</p><Button variant="outline" className="mt-5" onClick={() => refetch()}><RefreshCw />Попробовать снова</Button></SimplePage>;
  if (!data) return <SimplePage title="Нет доступа"><LockKeyhole className="mt-8 size-8 text-muted-foreground" /><p className="mt-5 text-sm leading-7 text-muted-foreground">Управление галереей доступно только администратору.</p><Button asChild variant="outline" className="mt-6"><Link to="/account">Мой кабинет<ArrowUpRight /></Link></Button></SimplePage>;

  const visibleWorks = artworks.filter((work) => work.ru.toLowerCase().includes(search.trim().toLowerCase()));
  const activeOrders = data.orders.filter((order) => order.status !== "cancelled" && order.status !== "completed");
  const visibleOrders = data.orders.filter((order) => orderFilter === "all" || order.status === orderFilter);
  const pricedCount = artworks.filter((work) => data.prices[work.id] != null).length;

  return (
    <SimplePage title="Управление галереей" kicker="Юлия Просецкая / Администратор" wide>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><span className="flex items-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="size-4" />Закрытый кабинет</span><Button asChild variant="editorial" className="px-0 text-xs"><Link to="/">Открыть сайт<ArrowUpRight /></Link></Button></div>
      <div className="mt-8 grid grid-cols-2 gap-x-5 border-y border-border py-6 md:grid-cols-4">
        <Summary icon={<Image />} label="Работ в галерее" value={String(artworks.length)} />
        <Summary icon={<Package />} label="Активных заказов" value={String(activeOrders.length)} />
        <Summary icon={<Settings />} label="Указаны цены" value={`${pricedCount} / ${artworks.length}`} />
        <Summary icon={<CreditCard />} label="Онлайн-оплата" value={data.settings.online_payment_enabled ? "Включена" : "Выключена"} />
      </div>
      {(note || error) && <p role={error ? "alert" : "status"} className={`mt-5 flex items-center gap-2 text-sm leading-6 ${error ? "text-destructive" : "text-primary"}`}>{!error && <CheckCircle2 className="size-4 shrink-0" />}{error || note}</p>}
      <Tabs defaultValue="works" className="mt-8">
        <TabsList aria-label="Разделы управления" className="grid h-auto w-full grid-cols-3 rounded-none border-b border-border bg-transparent p-0">
          {[{ value: "works", label: "Картины", icon: Image }, { value: "orders", label: "Заказы", icon: Package }, { value: "settings", label: "Настройки", icon: Settings }].map((tab) => <TabsTrigger key={tab.value} value={tab.value} className="h-12 gap-2 rounded-none border-b-2 border-transparent px-2 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none sm:text-sm"><tab.icon className="size-4" />{tab.label}</TabsTrigger>)}
        </TabsList>
        <TabsContent value="works" className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-5"><h2 className="font-display text-3xl">Картины и цены</h2><div className="relative w-full sm:w-72"><Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Поиск картины" placeholder="Найти картину" className="h-11 bg-card pl-10 shadow-none" /></div></div>
          <ul className="mt-6 border-t border-border">{visibleWorks.map((work) => <AdminPriceEditor key={work.id} work={work} price={data.prices[work.id] ?? null} onSaved={() => refresh("Цена сохранена")} />)}</ul>
          {visibleWorks.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">Картины не найдены.</p>}
        </TabsContent>
        <TabsContent value="orders" className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-4"><h2 className="font-display text-3xl">Заказы <span className="font-sans text-sm text-muted-foreground">({data.orders.length})</span></h2><Select value={orderFilter} onValueChange={setOrderFilter}><SelectTrigger aria-label="Фильтр заказов" className="h-11 w-full bg-card sm:w-52"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Все заказы</SelectItem>{Object.entries(statusLabel).map(([key, value]) => <SelectItem key={key} value={key}>{value.split(" — ")[0]}</SelectItem>)}</SelectContent></Select></div>
          {visibleOrders.length === 0 ? <div className="mt-8 border-y border-border py-16 text-center"><Package className="mx-auto size-8 text-muted-foreground" /><p className="mt-4 text-sm text-muted-foreground">{data.orders.length === 0 ? "Заказов пока нет" : "Нет заказов с этим статусом"}</p></div> : <ul className="mt-6 border-t border-border">{visibleOrders.map((order) => {
            const work = artworks.find((item) => item.id === order.artwork_id);
            return <li key={order.id} className="grid gap-5 border-b border-border py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px]">
              <div className="flex min-w-0 gap-4">{work && <img src={work.image} alt={order.artwork_title} className="h-20 w-16 shrink-0 bg-muted/40 object-contain" />}<div className="min-w-0"><p className="text-sm font-medium">{order.artwork_title}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{new Date(order.created_at).toLocaleDateString("ru-RU")} · {methodLabel[order.method]}</p><p className="mt-1 text-sm">{rub(order.amount)}</p></div></div>
              <div className="min-w-0 text-xs leading-6"><p className="font-medium">{order.customer_name}</p>{order.company && <p>{order.company}</p>}<a href={`tel:${order.customer_phone}`} className="block">{order.customer_phone}</a><a href={`mailto:${order.customer_email}`} className="block break-all text-muted-foreground">{order.customer_email}</a>{order.comment && <p className="mt-2 break-words text-muted-foreground">{order.comment}</p>}</div>
              <Select value={order.status} disabled={busy} onValueChange={(status) => run(() => saveAdminOrderStatus(order.id, status), "Статус заказа обновлён")}><SelectTrigger aria-label={`Статус заказа: ${order.artwork_title}`} className="h-11 bg-card"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(statusLabel).map(([key, value]) => <SelectItem key={key} value={key}>{value.split(" — ")[0]}</SelectItem>)}</SelectContent></Select>
            </li>;
          })}</ul>}
        </TabsContent>
        <TabsContent value="settings" className="mt-8">
          <section className="mb-10 border-b border-border pb-8">
            <h2 className="font-display text-3xl">Меню коллекции</h2>
            <div role="group" aria-label="Расположение меню коллекции" className="mt-5 inline-grid max-w-full grid-cols-2 border border-border p-1">
              <Button variant={data.settings.collection_menu_position === "top" ? "secondary" : "editorial"} disabled={busy} aria-pressed={data.settings.collection_menu_position === "top"} onClick={() => run(() => saveCollectionMenuPosition("top"), "Меню коллекции расположено сверху")} className="h-11 rounded-sm px-5"><PanelTop />Сверху</Button>
              <Button variant={data.settings.collection_menu_position === "left" ? "secondary" : "editorial"} disabled={busy} aria-pressed={data.settings.collection_menu_position === "left"} onClick={() => run(() => saveCollectionMenuPosition("left"), "Меню коллекции расположено слева")} className="h-11 rounded-sm px-5"><PanelLeft />Слева</Button>
            </div>
          </section>
          <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-16">
            <section><h2 className="font-display text-3xl">Показ на сайте</h2><div className="mt-6 flex items-center justify-between gap-5 border-y border-border py-5"><label htmlFor="show-prices" className="text-sm">Показывать цены</label><Switch id="show-prices" checked={data.settings.show_prices} disabled={busy} onCheckedChange={(value) => run(() => saveAdminSetting("show_prices", value), "Показ цен обновлён")} /></div><div className="flex items-center justify-between gap-5 border-b border-border py-5"><label htmlFor="online-payment" className="text-sm">Онлайн-оплата</label><Switch id="online-payment" checked={data.settings.online_payment_enabled} disabled={busy} onCheckedChange={(value) => run(() => saveAdminSetting("online_payment_enabled", value), "Настройка оплаты обновлена")} /></div><p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground"><span className={`size-2 rounded-full ${data.payment.shopId && data.payment.keySaved ? "bg-signal" : "bg-muted-foreground"}`} />{data.payment.shopId && data.payment.keySaved ? "Данные ЮKassa сохранены" : "Данные ЮKassa не заполнены"}</p></section>
            <form onSubmit={saveKassa}><h2 className="font-display text-3xl">ЮKassa</h2><div className="mt-6"><label htmlFor="kassa-shop" className="text-xs font-medium">Идентификатор магазина (shopId)</label><Input id="kassa-shop" name="shop" defaultValue={data.payment.shopId} maxLength={50} disabled={busy} className="mt-2 h-11 bg-card shadow-none" /></div><div className="mt-5"><label htmlFor="kassa-secret" className="text-xs font-medium">Секретный ключ</label><Input id="kassa-secret" name="secret" type="password" autoComplete="new-password" maxLength={200} disabled={busy} placeholder={data.payment.keySaved ? "Сохранён" : "Не указан"} className="mt-2 h-11 bg-card shadow-none" /></div><div className="mt-6 border-t border-border pt-5"><p className="text-xs font-medium">Адрес уведомлений</p><code className="mt-2 block break-all text-xs leading-6 text-muted-foreground">{webhook}</code><p className="mt-1 text-xs text-muted-foreground">payment.succeeded · payment.canceled</p></div><Button type="submit" disabled={busy} className="mt-6 h-11 w-full sm:w-auto">{busy ? <Loader2 className="animate-spin" /> : <Save />}Сохранить</Button></form>
          </div>
        </TabsContent>
      </Tabs>
    </SimplePage>
  );
}

function Summary({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="min-w-0 py-3"><span className="flex items-center gap-2 text-[11px] text-muted-foreground">{icon}{label}</span><p className="mt-3 break-words text-xl font-medium sm:text-2xl">{value}</p></div>;
}
