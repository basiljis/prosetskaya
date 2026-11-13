import { supabase } from "@/integrations/supabase/client";

// Queries and writes still run as the caller: database policies enforce admin access.
export async function loadAdminData() {
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) throw new Error("Не удалось проверить вход. Обновите страницу.");
  if (!auth.user) return null;
  const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", { _user_id: auth.user.id, _role: "admin" });
  if (roleError) throw new Error("Не удалось проверить права доступа.");
  if (!isAdmin) return null;
  const [settings, payment, prices, orders] = await Promise.all([
    supabase.from("site_settings").select("show_prices, online_payment_enabled").eq("id", 1).single(),
    supabase.from("payment_settings").select("yookassa_shop_id, yookassa_secret_key").eq("id", 1).single(),
    supabase.from("artwork_prices").select("artwork_id, price"),
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
  ]);
  if (settings.error || payment.error || prices.error || orders.error || !settings.data || !payment.data) {
    throw new Error("Не удалось загрузить настройки. Попробуйте ещё раз.");
  }
  return {
    settings: settings.data,
    payment: { shopId: payment.data.yookassa_shop_id, keySaved: Boolean(payment.data.yookassa_secret_key) },
    prices: Object.fromEntries((prices.data ?? []).map((row) => [row.artwork_id, row.price])) as Record<string, number | null>,
    orders: orders.data ?? [],
  };
}

export async function saveAdminSetting(key: "show_prices" | "online_payment_enabled", value: boolean) {
  const change = key === "show_prices" ? { show_prices: value } : { online_payment_enabled: value };
  const { data, error } = await supabase.from("site_settings").update({ ...change, updated_at: new Date().toISOString() }).eq("id", 1).select("id").single();
  if (error || !data) throw new Error("Настройка не сохранена. Попробуйте ещё раз.");
}

export async function saveAdminPayment(shop: string, secret: string) {
  const { data, error } = await supabase.from("payment_settings").update({
    yookassa_shop_id: shop.trim().slice(0, 50),
    ...(secret.trim() ? { yookassa_secret_key: secret.trim().slice(0, 200) } : {}),
    updated_at: new Date().toISOString(),
  }).eq("id", 1).select("id").single();
  if (error || !data) throw new Error("Данные ЮKassa не сохранены. Попробуйте ещё раз.");
}

export async function saveAdminPrice(id: string, price: number | null) {
  const { data, error } = await supabase.from("artwork_prices").upsert({ artwork_id: id, price, updated_at: new Date().toISOString() }).select("artwork_id").single();
  if (error || !data) throw new Error("Цена не сохранена. Попробуйте ещё раз.");
}

export async function saveAdminOrderStatus(id: string, status: string) {
  const { data, error } = await supabase.from("orders").update({ status }).eq("id", id).select("id").single();
  if (error || !data) throw new Error("Статус не сохранён. Попробуйте ещё раз.");
}