import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { createUserAccount } from "@/lib/users.functions";
import { useServerFn } from "@tanstack/react-start";
import { loadAdminUsers, setAdminUserRole, type AdminUser } from "@/lib/admin";

const date = (v: string | null) => (v ? new Date(v).toLocaleDateString("ru-RU") : "—");

/** Registered accounts with their roles; admins grant or revoke the admin role here. */
export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [me, setMe] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const load = () => loadAdminUsers().then(setUsers).catch((e: Error) => toast.error(e.message));
  useEffect(() => { void load(); void supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null)); }, []);
  const toggle = async (u: AdminUser, on: boolean) => {
    setBusy(u.id);
    try { await setAdminUserRole(u.id, "admin", on); toast.success(on ? `${u.email} — администратор` : `${u.email} — роль администратора снята`); await load(); }
    catch (e) { toast.error((e as Error).message); }
    finally { setBusy(null); }
  };
  const create = useServerFn(createUserAccount);
  const [nu, setNu] = useState({ email: "", password: "", admin: false });
  const add = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy("new");
    try { const r = await create({ data: nu }); if (!r.ok) toast.error(r.error); else { toast.success(`Пользователь ${nu.email} добавлен`); setNu({ email: "", password: "", admin: false }); await load(); } }
    catch { toast.error("Не удалось создать пользователя. Пароль — не короче 8 символов."); }
    finally { setBusy(null); }
  };
  const list = (users ?? []).filter((u) => u.email.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <section className="mb-10 border-b border-border pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h2 className="font-display text-3xl">Пользователи и роли</h2><p className="mt-2 text-sm text-muted-foreground">Все зарегистрированные аккаунты. Включите переключатель, чтобы дать доступ к админ-панели.</p></div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск по почте" className="h-10 w-64 border-b border-border bg-transparent text-sm outline-none focus:border-primary" />
      </div>
      <form onSubmit={add} className="mt-6 flex flex-wrap items-end gap-3 border border-border p-4">
        <p className="w-full text-xs uppercase tracking-[0.12em] text-muted-foreground">Добавить пользователя</p>
        <input required type="email" value={nu.email} onChange={(e) => setNu({ ...nu, email: e.target.value })} placeholder="Почта" aria-label="Почта нового пользователя" className="h-10 min-w-56 flex-1 border-b border-border bg-transparent text-sm outline-none focus:border-primary" />
        <input required minLength={8} type="text" value={nu.password} onChange={(e) => setNu({ ...nu, password: e.target.value })} placeholder="Пароль (от 8 символов)" aria-label="Пароль нового пользователя" className="h-10 min-w-48 flex-1 border-b border-border bg-transparent text-sm outline-none focus:border-primary" />
        <label className="flex h-10 items-center gap-2 text-sm"><Switch checked={nu.admin} onCheckedChange={(v) => setNu({ ...nu, admin: v })} />Администратор</label>
        <button type="submit" disabled={busy === "new"} className="h-10 bg-primary px-5 text-sm text-primary-foreground disabled:opacity-50">{busy === "new" ? "Создаём…" : "Добавить"}</button>
      </form>
      {!users ? <p className="mt-6 text-sm text-muted-foreground">Загрузка…</p> : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead><tr className="border-b border-border text-left text-xs uppercase tracking-[0.12em] text-muted-foreground"><th className="py-3 font-normal">Почта</th><th className="font-normal">Регистрация</th><th className="font-normal">Последний вход</th><th className="font-normal">Роль</th><th className="text-right font-normal">Администратор</th></tr></thead>
            <tbody>{list.map((u) => {
              const admin = u.roles.includes("admin");
              return <tr key={u.id} className="border-b border-border">
                <td className="py-3">{u.email}{u.id === me && <span className="ml-2 text-xs text-muted-foreground">(вы)</span>}</td>
                <td>{date(u.created_at)}</td><td>{date(u.last_sign_in_at)}</td>
                <td><span className={admin ? "text-primary" : "text-muted-foreground"}>{admin ? "Администратор" : "Покупатель"}</span></td>
                <td className="text-right"><Switch checked={admin} disabled={busy === u.id || (admin && u.id === me)} onCheckedChange={(v) => void toggle(u, v)} aria-label={`Администратор: ${u.email}`} title={admin && u.id === me ? "Нельзя снять роль с себя" : "Доступ к админ-панели"} /></td>
              </tr>;
            })}</tbody>
          </table>
          <p className="mt-3 text-xs text-muted-foreground">Всего: {users.length}</p>
        </div>
      )}
    </section>
  );
}
