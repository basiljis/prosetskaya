import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ArrowUpRight, CheckCircle2, CreditCard, Image, Loader2, LockKeyhole, Package, BarChart3, BookOpen, Newspaper, Tags, PanelLeft, PanelTop, RefreshCw, Save, Search, Settings } from "lucide-react";
import { SimplePage } from "@/components/simple-page";
import { AdminTaxonomy } from "@/components/admin-taxonomy";
import { AdminUpload } from "@/components/admin-upload";
import { AdminNews } from "@/components/admin-news";
import { AdminCv } from "@/components/admin-cv";
import { genres as genreDefaults, resolveTerms, styles as styleDefaults } from "@/lib/genres";
import { resolveCv } from "@/lib/cv";
import { AdminStats } from "@/components/admin-stats";
import { AdminProjects } from "@/components/admin-projects";
import { Pager } from "@/components/pager";
import { pageCount, pageSlice, resolveDirections } from "@/lib/directions";
import { AdminPriceEditor } from "@/components/admin-price-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AdminUsers } from "@/components/admin-users";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { artworks as staticArtworks } from "@/lib/artworks";
import { methodLabel, rub, statusLabel } from "@/lib/shop";
import { loadAdminArtworks, loadAdminData, loadAdminProjects, saveAdminOrderStatus, saveAdminPayment, saveAdminSetting, saveCollectionMenuPosition, saveSiteJson } from "@/lib/admin";

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
  const [workFilter, setWorkFilter] = useState("all");
  const [saleFilter, setSaleFilter] = useState("all");
  const [styleFilter, setStyleFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("all");
  const [orderFilter, setOrderFilter] = useState("all");
  const [webhook, setWebhook] = useState("");
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["admin"], queryFn: loadAdminData, retry: 1, refetchInterval: 15_000 });
  const rows = useQuery({ queryKey: ["admin-artworks"], queryFn: loadAdminArtworks, enabled: !!data }).data ?? [];
  const projectQuery = useQuery({ queryKey: ["admin-projects"], queryFn: loadAdminProjects, enabled: !!data });
  const projects = projectQuery.data ?? [];
  const [page, setPage] = useState(1);
  useEffect(() => { setWebhook(`${window.location.origin}/api/public/yookassa`); }, []);
  const refresh = (message: string) => {
    setNote(message); setError("");
    void Promise.all(["admin", "admin-artworks", "admin-projects", "projects", "public-projects", "artworks", "shop", "account", "bell"].map((key) => qc.invalidateQueries({ queryKey: [key] })));
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

  const artworks = rows;
  const visibleWorks = rows.filter((work) => work.title_ru.toLowerCase().includes(search.trim().toLowerCase()) && matchesWorkFilter(work, workFilter) && matchesSale(work, saleFilter) && (styleFilter === "all" || work.style === styleFilter) && (genreFilter === "all" || work.genre === genreFilter));
  const styleTermsA = resolveTerms(data.settings.styles, styleDefaults); const genreTermsA = resolveTerms(data.settings.genres, genreDefaults);
  const activeOrders = data.orders.filter((order) => order.status !== "cancelled" && order.status !== "completed");
  const visibleOrders = data.orders.filter((order) => orderFilter === "all" || order.status === orderFilter);
  const pricedCount = artworks.filter((work) => data.prices[work.id] != null).length;

  return (
    <SimplePage title="Управление галереей" kicker="Юлия Просецкая / Администратор" wide>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><span className="flex items-center gap-3 text-xs text-muted-foreground"><LockKeyhole className="size-4" />Закрытый кабинет</span><Button asChild variant="editorial" className="px-0 text-xs"><Link to="/">Открыть сайт<ArrowUpRight /></Link></Button></div>
      {(note || error) && <p role={error ? "alert" : "status"} className={`mt-5 flex items-center gap-2 text-sm leading-6 ${error ? "text-destructive" : "text-primary"}`}>{!error && <CheckCircle2 className="size-4 shrink-0" />}{error || note}</p>}
      <Tabs defaultValue="works" className="mt-8 items-start gap-x-8 md:grid md:grid-cols-[170px_minmax(0,1fr)]">
        <TabsList aria-label="Разделы управления" className="grid h-auto w-full grid-cols-2 rounded-none border-b border-border bg-transparent p-0 sm:grid-cols-4 md:sticky md:top-6 md:col-start-1 md:row-start-1 md:flex md:flex-col md:border-b-0 md:border-r md:pr-3">
          {[{ value: "works", label: "Картины", icon: Image }, { value: "projects", label: "Спецпроекты", icon: PanelTop }, { value: "orders", label: "Заказы", icon: Package }, { value: "stats", label: "Статистика", icon: BarChart3 }, { value: "news", label: "Новости", icon: Newspaper }, { value: "cv", label: "Резюме", icon: BookOpen }, { value: "dicts", label: "Справочники", icon: Tags }, { value: "settings", label: "Настройки", icon: Settings }].map((tab) => <TabsTrigger key={tab.value} value={tab.value} className="h-12 w-full gap-2 md:justify-start rounded-none border-b-2 border-transparent px-2 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none sm:text-sm"><tab.icon className="size-4" />{tab.label}</TabsTrigger>)}
        </TabsList>
        <TabsContent value="works" className="mt-8 min-w-0 w-full md:col-start-2 md:row-start-1 md:mt-0">
          <div className="flex flex-wrap items-center justify-between gap-5"><h2 className="font-display text-3xl">Картины и цены <span className="font-sans text-sm text-muted-foreground">({rows.length})</span></h2><div className="relative w-full sm:w-72"><Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" /><Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} aria-label="Поиск картины" placeholder="Найти картину" className="h-11 bg-card pl-10 shadow-none" /></div></div>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Фильтр картин">{workFilters.map(([k, label]) => <Button key={k} type="button" size="sm" variant={workFilter === k ? "default" : "outline"} aria-pressed={workFilter === k} onClick={() => { setWorkFilter(k); setPage(1); }}>{label} <span className="opacity-60">{rows.filter((w) => matchesWorkFilter(w, k)).length}</span></Button>)}</div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <Select value={saleFilter} onValueChange={(v) => { setSaleFilter(v); setPage(1); }}><SelectTrigger aria-label="Фильтр по продаже" className="h-10 bg-card"><SelectValue /></SelectTrigger><SelectContent>{saleFilters.map(([k, l]) => <SelectItem key={k} value={k}>{l} ({rows.filter((w) => matchesSale(w, k)).length})</SelectItem>)}</SelectContent></Select>
            <Select value={genreFilter} onValueChange={(v) => { setGenreFilter(v); setPage(1); }}><SelectTrigger aria-label="Фильтр по жанру" className="h-10 bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Все жанры</SelectItem>{genreTermsA.map((t) => <SelectItem key={t.key} value={t.key}>{t.ru} ({rows.filter((w) => w.genre === t.key).length})</SelectItem>)}</SelectContent></Select>
            <Select value={styleFilter} onValueChange={(v) => { setStyleFilter(v); setPage(1); }}><SelectTrigger aria-label="Фильтр по направлению" className="h-10 bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Все направления</SelectItem>{styleTermsA.map((t) => <SelectItem key={t.key} value={t.key}>{t.ru} ({rows.filter((w) => w.style === t.key).length})</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="mt-6"><AdminUpload genres={resolveTerms(data.settings.genres, genreDefaults)} styles={resolveTerms(data.settings.styles, styleDefaults)} projects={projects} onSaved={refresh} /></div>
          <ul className="mt-6 border-t border-border">{pageSlice(visibleWorks, page, 40).map((work) => <AdminPriceEditor key={work.id} work={work} price={data.prices[work.id] ?? null} projects={projects} onSaved={refresh} />)}</ul>
          <Pager page={Math.min(page, pageCount(visibleWorks.length, 40))} pages={pageCount(visibleWorks.length, 40)} label="Страницы картин" onChange={(n) => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
          {visibleWorks.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">Картины не найдены.</p>}
        </TabsContent>
        <TabsContent value="projects" className="mt-8 min-w-0 w-full md:col-start-2 md:row-start-1 md:mt-0">
          {projectQuery.isLoading ? <p role="status" className="text-sm text-muted-foreground">Загружаем спецпроекты…</p> : projectQuery.isError ? <div><p role="alert" className="text-sm text-destructive">Не удалось загрузить спецпроекты.</p><Button variant="outline" onClick={() => projectQuery.refetch()} className="mt-4"><RefreshCw />Повторить</Button></div> : <AdminProjects projects={projects} works={rows} onSaved={refresh} />}
        </TabsContent>
        <TabsContent value="stats" className="mt-8 min-w-0 w-full md:col-start-2 md:row-start-1 md:mt-0">
          <Tabs defaultValue="visits"><TabsList><TabsTrigger value="visits">Посещения</TabsTrigger><TabsTrigger value="summary">Работы и заказы</TabsTrigger></TabsList><TabsContent value="summary">
      <div className="mb-10 grid grid-cols-2 gap-x-5 border-y border-border py-6 md:grid-cols-4">
        <Summary icon={<Image />} label="Работ в галерее" value={String(artworks.length)} />
        <Summary icon={<Package />} label="Активных заказов" value={String(activeOrders.length)} />
        <Summary icon={<Settings />} label="Указаны цены" value={`${pricedCount} / ${artworks.length}`} />
        <Summary icon={<CreditCard />} label="Онлайн-оплата" value={data.settings.online_payment_enabled ? "Включена" : "Выключена"} />
      </div>
          </TabsContent><TabsContent value="visits"><AdminStats /></TabsContent></Tabs>
        </TabsContent>
        <TabsContent value="news" className="mt-8 min-w-0 w-full md:col-start-2 md:row-start-1 md:mt-0"><AdminNews onSaved={(m) => refresh(m)} /></TabsContent>
        <TabsContent value="cv" className="mt-8 min-w-0 w-full md:col-start-2 md:row-start-1 md:mt-0"><AdminCv initial={resolveCv(data.settings.cv)} busy={busy} onSave={(cv) => run(() => saveSiteJson("cv", cv), "Резюме сохранено")} /></TabsContent>
        <TabsContent value="dicts" className="mt-8 min-w-0 w-full md:col-start-2 md:row-start-1 md:mt-0">
          <Tabs defaultValue="genres"><TabsList><TabsTrigger value="genres">Жанры</TabsTrigger><TabsTrigger value="styles">Направления</TabsTrigger></TabsList>
          <TabsContent value="genres"><AdminTaxonomy title="Жанры" hint="Жанры — основные фильтры раздела «Все работы». Можно переименовать, упорядочить, скрыть или добавить новый." initial={resolveTerms(data.settings.genres, genreDefaults)} busy={busy} onSave={(t) => run(() => saveSiteJson("genres", t), "Жанры сохранены")} /></TabsContent>
          <TabsContent value="styles"><AdminTaxonomy title="Направления (стили)" hint="Выпадающий фильтр «Направление» и выбор в карточке работы." initial={resolveTerms(data.settings.styles, styleDefaults)} busy={busy} onSave={(t) => run(() => saveSiteJson("styles", t), "Направления сохранены")} /></TabsContent></Tabs>
        </TabsContent>
        <TabsContent value="orders" className="mt-8 min-w-0 w-full md:col-start-2 md:row-start-1 md:mt-0">
          <div className="flex flex-wrap items-center justify-between gap-4"><h2 className="font-display text-3xl">Заказы <span className="font-sans text-sm text-muted-foreground">({data.orders.length})</span></h2><Select value={orderFilter} onValueChange={setOrderFilter}><SelectTrigger aria-label="Фильтр заказов" className="h-11 w-full bg-card sm:w-52"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Все заказы</SelectItem>{Object.entries(statusLabel).map(([key, value]) => <SelectItem key={key} value={key}>{value.split(" — ")[0]}</SelectItem>)}</SelectContent></Select></div>
          {visibleOrders.length === 0 ? <div className="mt-8 border-y border-border py-16 text-center"><Package className="mx-auto size-8 text-muted-foreground" /><p className="mt-4 text-sm text-muted-foreground">{data.orders.length === 0 ? "Заказов пока нет" : "Нет заказов с этим статусом"}</p></div> : <ul className="mt-6 border-t border-border">{visibleOrders.map((order) => {
            const work = staticArtworks.find((item) => item.id === order.artwork_id) ?? rows.map((r) => ({ id: r.id, image: r.image_url })).find((item) => item.id === order.artwork_id);
            return <li key={order.id} className="grid gap-5 border-b border-border py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px]">
              <div className="flex min-w-0 gap-4">{work && <img src={work.image} alt={order.artwork_title} className="h-20 w-16 shrink-0 bg-muted/40 object-contain" />}<div className="min-w-0"><p className="text-sm font-medium">{order.artwork_title}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{new Date(order.created_at).toLocaleDateString("ru-RU")} · {methodLabel[order.method]}</p><p className="mt-1 text-sm">{rub(order.amount)}</p></div></div>
              <div className="min-w-0 text-xs leading-6"><p className="font-medium">{order.customer_name}</p>{order.company && <p>{order.company}</p>}<a href={`tel:${order.customer_phone}`} className="block">{order.customer_phone}</a><a href={`mailto:${order.customer_email}`} className="block break-all text-muted-foreground">{order.customer_email}</a>{order.comment && <p className="mt-2 break-words text-muted-foreground">{order.comment}</p>}</div>
              <Select value={order.status} disabled={busy} onValueChange={(status) => run(() => saveAdminOrderStatus(order.id, status), "Статус заказа обновлён")}><SelectTrigger aria-label={`Статус заказа: ${order.artwork_title}`} className="h-11 bg-card"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(statusLabel).map(([key, value]) => <SelectItem key={key} value={key}>{value.split(" — ")[0]}</SelectItem>)}</SelectContent></Select>
            </li>;
          })}</ul>}
        </TabsContent>
        <TabsContent value="settings" className="mt-8 min-w-0 w-full md:col-start-2 md:row-start-1 md:mt-0">
          <Tabs defaultValue="users"><TabsList className="mb-6 flex h-auto flex-wrap justify-start gap-1 bg-transparent"><TabsTrigger value="users">Пользователи</TabsTrigger><TabsTrigger value="collection">Коллекция</TabsTrigger><TabsTrigger value="display">Показ и оплата</TabsTrigger><TabsTrigger value="payment">ЮKassa</TabsTrigger></TabsList>
          <TabsContent value="users"><AdminUsers /></TabsContent>
          <TabsContent value="collection"><section className="mb-10 border-b border-border pb-8">
            <h2 className="font-display text-3xl">Меню коллекции</h2>
            <div role="group" aria-label="Расположение меню коллекции" className="mt-5 inline-grid max-w-full grid-cols-2 border border-border p-1">
              <Button variant={data.settings.collection_menu_position === "top" ? "secondary" : "editorial"} disabled={busy} aria-pressed={data.settings.collection_menu_position === "top"} onClick={() => run(() => saveCollectionMenuPosition("top"), "Меню коллекции расположено сверху")} className="h-11 rounded-sm px-5"><PanelTop />Сверху</Button>
              <Button variant={data.settings.collection_menu_position === "left" ? "secondary" : "editorial"} disabled={busy} aria-pressed={data.settings.collection_menu_position === "left"} onClick={() => run(() => saveCollectionMenuPosition("left"), "Меню коллекции расположено слева")} className="h-11 rounded-sm px-5"><PanelLeft />Слева</Button>
            </div>
            <div className="mt-6 flex max-w-md items-center justify-between gap-5 border-y border-border py-5"><label htmlFor="show-style-filter" className="text-sm">Показывать фильтр «Направления» во «Все работы»</label><Switch id="show-style-filter" checked={data.settings.show_style_filter !== false} disabled={busy} onCheckedChange={(value) => run(() => saveAdminSetting("show_style_filter", value), value ? "Фильтр «Направления» показан" : "Фильтр «Направления» скрыт")} /></div>
          </section>
          </TabsContent>
          <TabsContent value="display"><section><h2 className="font-display text-3xl">Показ на сайте</h2><div className="mt-6 flex items-center justify-between gap-5 border-y border-border py-5"><label htmlFor="show-prices" className="text-sm">Показывать цены</label><Switch id="show-prices" checked={data.settings.show_prices} disabled={busy} onCheckedChange={(value) => run(() => saveAdminSetting("show_prices", value), "Показ цен обновлён")} /></div><div className="flex items-center justify-between gap-5 border-b border-border py-5"><label htmlFor="online-payment" className="text-sm">Онлайн-оплата</label><Switch id="online-payment" checked={data.settings.online_payment_enabled} disabled={busy} onCheckedChange={(value) => run(() => saveAdminSetting("online_payment_enabled", value), "Настройка оплаты обновлена")} /></div><p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground"><span className={`size-2 rounded-full ${data.payment.shopId && data.payment.keySaved ? "bg-signal" : "bg-muted-foreground"}`} />{data.payment.shopId && data.payment.keySaved ? "Данные ЮKassa сохранены" : "Данные ЮKassa не заполнены"}</p></section>
          </TabsContent><TabsContent value="payment"><form onSubmit={saveKassa}><h2 className="font-display text-3xl">ЮKassa</h2><div className="mt-6"><label htmlFor="kassa-shop" className="text-xs font-medium">Идентификатор магазина (shopId)</label><Input id="kassa-shop" name="shop" defaultValue={data.payment.shopId} maxLength={50} disabled={busy} className="mt-2 h-11 bg-card shadow-none" /></div><div className="mt-5"><label htmlFor="kassa-secret" className="text-xs font-medium">Секретный ключ</label><Input id="kassa-secret" name="secret" type="password" autoComplete="new-password" maxLength={200} disabled={busy} placeholder={data.payment.keySaved ? "Сохранён" : "Не указан"} className="mt-2 h-11 bg-card shadow-none" /></div><div className="mt-6 border-t border-border pt-5"><p className="text-xs font-medium">Адрес уведомлений</p><code className="mt-2 block break-all text-xs leading-6 text-muted-foreground">{webhook}</code><p className="mt-1 text-xs text-muted-foreground">payment.succeeded · payment.canceled</p></div><Button type="submit" disabled={busy} className="mt-6 h-11 w-full sm:w-auto">{busy ? <Loader2 className="animate-spin" /> : <Save />}Сохранить</Button></form>
          </TabsContent></Tabs>
        </TabsContent>
      </Tabs>
    </SimplePage>
  );
}

function Summary({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="min-w-0 py-3"><span className="flex items-center gap-2 text-[11px] text-muted-foreground">{icon}{label}</span><p className="mt-3 break-words text-xl font-medium sm:text-2xl">{value}</p></div>;
}

const workFilters = [["all", "Все"], ["no-size", "Нет размера"], ["no-genre", "Нет жанра"], ["no-style", "Нет направления"], ["hidden", "Скрытые"]] as const;
function matchesWorkFilter(w: { size: string; genre?: string | null; style?: string | null; hidden: boolean }, f: string) {
  return f === "no-size" ? !w.size.trim() : f === "no-genre" ? !w.genre : f === "no-style" ? !w.style : f === "hidden" ? w.hidden : true;
}

const saleFilters = [["all", "Продажа: все"], ["sale", "В продаже"], ["sold", "Проданы"], ["not-for-sale", "Не продаются (коллекции, проекты)"]] as const;
function matchesSale(w: { source_availability: string | null; catalogue_only: boolean }, f: string) {
  return f === "sale" ? !w.source_availability && !w.catalogue_only : f === "sold" ? w.source_availability === "sold" : f === "not-for-sale" ? w.catalogue_only || w.source_availability === "private" || w.source_availability === "museum" : true;
}
