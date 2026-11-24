import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { statusLabel } from "@/lib/shop";

const SEEN_KEY = "prosetskaya-orders-seen";

/** Bell for buyers (status changes since last view) and admins (new requests awaiting a reply). */
export function NotificationBell({ admin }: { admin: boolean }) {
  const [seen, setSeen] = useState<string>("");
  const [open, setOpen] = useState(false);
  useEffect(() => { setSeen(localStorage.getItem(SEEN_KEY) ?? ""); }, []);
  const { data = [] } = useQuery({
    queryKey: ["bell", admin], refetchInterval: 60_000,
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      let q = supabase.from("orders").select("id, artwork_title, status, updated_at, created_at, customer_name").order("updated_at", { ascending: false }).limit(20);
      q = admin ? q.eq("status", "new") : q.eq("user_id", u.user.id);
      const { data: rows } = await q;
      return rows ?? [];
    },
  });
  const items = admin ? data : data.filter((o) => o.updated_at > o.created_at && (!seen || o.updated_at > seen));
  const toggle = () => {
    setOpen(!open);
    if (!open && !admin && data[0]) { localStorage.setItem(SEEN_KEY, data[0].updated_at); }
    if (open && !admin && data[0]) setSeen(data[0].updated_at);
  };
  return <div className="relative">
    <button type="button" onClick={toggle} title={admin ? "Новые заявки" : "Уведомления о заказах"} aria-label={admin ? "Новые заявки" : "Уведомления о заказах"} className="relative grid size-10 place-items-center rounded-full border border-border hover:bg-muted">
      <Bell className="size-4" />
      {items.length > 0 && <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">{items.length}</span>}
    </button>
    {open && <div className="absolute right-0 z-40 mt-2 w-72 border border-border bg-card p-3 text-sm shadow-lg">
      <p className="mb-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">{admin ? "Новые заявки" : "Изменения заказов"}</p>
      {items.length === 0 ? <p className="text-xs text-muted-foreground">Нет новых уведомлений</p> : <ul className="space-y-2">{items.map((o) => <li key={o.id} className="border-b border-border pb-2 last:border-0"><p>{o.artwork_title}</p><p className="text-xs text-muted-foreground">{admin ? `${o.customer_name} · ${new Date(o.created_at).toLocaleDateString("ru-RU")}` : statusLabel[o.status]}</p></li>)}</ul>}
      {admin && <Link to="/admin" className="mt-3 block text-xs underline">Открыть заказы</Link>}
    </div>}
  </div>;
}
