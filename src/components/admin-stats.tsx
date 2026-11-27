import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/lib/backend/client";
import { Button } from "@/components/ui/button";
import { summarize, type Visit } from "@/lib/visits";

const deviceRu: Record<string, string> = { desktop: "Компьютер", mobile: "Телефон", tablet: "Планшет" };
const pageRu = (p: string) => p === "/" ? "Главная" : p === "/cv" ? "Резюме" : p.startsWith("/projects/") ? `Спецпроект: ${p.slice(10)}` : p === "/projects" ? "Все спецпроекты" : p;

export function AdminStats() {
  const [metric, setMetric] = useState<"views" | "visitors">("visitors");
  const [days, setDays] = useState(30);
  const q = useQuery({ queryKey: ["admin-visits"], queryFn: async () => {
    const since = new Date(Date.now() - 90 * 864e5).toISOString();
    const { data, error } = await supabase.from("page_views").select("path,referrer,device,visitor_id,created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(20000);
    if (error) throw error; return data as Visit[];
  } });
  if (q.isLoading) return <p role="status" className="text-sm text-muted-foreground">Загружаем статистику…</p>;
  if (q.isError) return <div><p role="alert" className="text-sm text-destructive">Не удалось загрузить статистику.</p><Button variant="outline" className="mt-4" onClick={() => q.refetch()}><RefreshCw />Повторить</Button></div>;
  const s = summarize(q.data ?? [], days); const chart = metric === "visitors" ? s.dailyVisitors : s.daily; const max = Math.max(1, ...chart.map((d) => d[1]));
  const List = ({ title, rows, label }: { title: string; rows: [string, number][]; label?: (k: string) => string }) => (
    <section className="border border-border bg-card p-5"><h3 className="text-xs uppercase tracking-widest text-muted-foreground">{title}</h3>
      {rows.length ? <ul className="mt-4 space-y-2 text-sm">{rows.map(([k, n]) => <li key={k} className="flex justify-between gap-4"><span className="truncate">{label ? label(k) : k}</span><span className="tabular-nums text-muted-foreground">{n}</span></li>)}</ul> : <p className="mt-4 text-sm text-muted-foreground">Пока нет данных</p>}
    </section>);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4"><h2 className="font-display text-3xl">Посещения</h2>
        <div className="flex gap-2">{[1, 7, 30, 90].map((d) => <Button key={d} size="sm" variant={d === days ? "default" : "outline"} onClick={() => setDays(d)}>{d === 1 ? "Сегодня" : `${d} дн.`}</Button>)}<Button size="icon" variant="ghost" aria-label="Обновить" onClick={() => q.refetch()}><RefreshCw /></Button></div></div>
      <div className="grid gap-4 sm:grid-cols-2"><div className="border border-border bg-card p-5"><p className="text-xs uppercase tracking-widest text-muted-foreground">Просмотры страниц</p><p className="mt-2 font-display text-5xl">{s.views}</p></div><div className="border border-border bg-card p-5"><p className="text-xs uppercase tracking-widest text-muted-foreground">Уникальные посетители</p><p className="mt-2 font-display text-5xl">{s.visitors}</p></div></div>
      {days > 1 && <section className="border border-border bg-card p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-xs uppercase tracking-widest text-muted-foreground">По дням</h3><div className="flex gap-2"><Button size="sm" variant={metric === "visitors" ? "default" : "outline"} onClick={() => setMetric("visitors")}>Уникальные</Button><Button size="sm" variant={metric === "views" ? "default" : "outline"} onClick={() => setMetric("views")}>Просмотры</Button></div></div>
        <div className="mt-6 flex h-48 items-end gap-[3px]">{chart.map(([d, n], i) => { const step = Math.ceil(chart.length / 15); const show = i % step === 0 || i === chart.length - 1; return <div key={d} title={`${d.slice(8, 10)}.${d.slice(5, 7)}: ${n}`} className="group relative flex h-full flex-1 flex-col justify-end">
          {(chart.length <= 31 || n === max) && n > 0 && <span className="mb-1 text-center text-[10px] tabular-nums text-muted-foreground">{n}</span>}
          <div className="rounded-t-sm bg-primary/80 transition-colors group-hover:bg-primary" style={{ height: `${Math.max(2, (n / max) * 100)}%` }} />
          <span className={`absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] tabular-nums text-muted-foreground ${show ? "" : "invisible"}`}>{d.slice(8, 10)}.{d.slice(5, 7)}</span>
        </div>; })}</div><div className="h-6" /></section>}
      <div className="grid gap-4 md:grid-cols-3"><List title="Страницы" rows={s.pages} label={pageRu} /><List title="Источники" rows={s.refs} /><List title="Устройства" rows={s.devices} label={(k) => deviceRu[k] ?? k} /></div>
      <p className="text-xs text-muted-foreground">Учитываются посещения с момента включения статистики; посетитель определяется по браузеру.</p>
    </div>);
}
