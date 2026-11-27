import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/lib/backend/client";
import { statusLabel } from "@/lib/shop";
import { unreadOrders } from "@/lib/order-notifications";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/** Session-keyed query respects order RLS; no visitor gets another user's notices. */
export function NotificationBell() {
  const [seen, setSeen] = useState("");
  const [open, setOpen] = useState(false);
  const identity = useQuery({ queryKey: ["bell-identity"], staleTime: 30_000, queryFn: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    const { data: admin } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
    return { id: data.user.id, admin: !!admin };
  } });
  const user = identity.data;
  const key = `prosetskaya-orders-seen:${user?.id ?? ""}`;
  useEffect(() => { setSeen(localStorage.getItem(key) ?? ""); }, [key]);
  const orders = useQuery({ queryKey: ["bell", user?.id, user?.admin], enabled: !!user, refetchInterval: 15_000, queryFn: async () => {
    if (!user) return [];
    let q = supabase.from("orders").select("id, artwork_title, status, updated_at, created_at, customer_name").order("updated_at", { ascending: false }).limit(100);
    q = user.admin ? q.eq("status", "new") : q.eq("user_id", user.id);
    const { data, error } = await q;
    if (error) throw error;
    return data ?? [];
  } });
  if (!user) return null;
  const rows = orders.data ?? [];
  const unread = unreadOrders(rows, user.admin, seen);
  const toggle = (value: boolean) => {
    setOpen(value);
    if (!value && rows[0]) { const last = rows[0].updated_at; localStorage.setItem(key, last); setSeen(last); }
  };
  return <Popover open={open} onOpenChange={toggle}><PopoverTrigger asChild>
    <Button variant="editorial" size="icon" title="Уведомления" aria-label="Уведомления" className="relative size-9 shrink-0 rounded-full">
      <Bell className="size-4" />
      {unread.length > 0 && <span className="absolute -right-0.5 top-0 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] text-primary-foreground">{unread.length}</span>}
    </Button>
  </PopoverTrigger><PopoverContent align="end" className="z-[110] w-[min(320px,90vw)]">
    <p className="mb-3 text-xs uppercase text-muted-foreground">{user.admin ? "Новые заявки" : "Мои заказы"}</p>
    {orders.isError ? <p role="alert" className="text-xs text-destructive">Не удалось загрузить уведомления.</p> : orders.isLoading ? <p className="text-xs">Загрузка…</p> : rows.length === 0 ? <p className="text-xs text-muted-foreground">Нет уведомлений</p> : <ul className="max-h-72 space-y-3 overflow-y-auto">{rows.map((o) => <li key={o.id} className="border-b border-border pb-3 text-sm last:border-0"><p className="font-medium">{o.artwork_title}</p><p className="mt-1 text-xs text-muted-foreground">{user.admin ? `${o.customer_name} · ` : ""}{statusLabel[o.status] ?? o.status}</p></li>)}</ul>}
    <Button asChild variant="editorial" className="mt-3 px-0 text-xs"><Link to={user.admin ? "/admin" : "/account"} onClick={() => toggle(false)}>{user.admin ? "Открыть заявки" : "Мои заказы"}</Link></Button>
  </PopoverContent></Popover>;
}
