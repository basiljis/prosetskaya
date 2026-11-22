import { supabase } from "@/integrations/supabase/client";
import { collectionMenuPosition, type CollectionMenuPosition } from "@/lib/collection-layout";
import type { Project } from "@/lib/projects";

// Queries and writes still run as the caller: database policies enforce admin access.
export async function loadAdminData() {
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) throw new Error("Не удалось проверить вход. Обновите страницу.");
  if (!auth.user) return null;
  const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", { _user_id: auth.user.id, _role: "admin" });
  if (roleError) throw new Error("Не удалось проверить права доступа.");
  if (!isAdmin) return null;
  const [settings, payment, prices, orders] = await Promise.all([
    supabase.from("site_settings").select("show_prices, online_payment_enabled, collection_menu_position, collection_directions, genres, styles, cv, show_style_filter").eq("id", 1).single(),
    supabase.from("payment_settings").select("yookassa_shop_id, yookassa_secret_key").eq("id", 1).single(),
    supabase.from("artwork_prices").select("artwork_id, price"),
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
  ]);
  if (settings.error || payment.error || prices.error || orders.error || !settings.data || !payment.data) {
    throw new Error("Не удалось загрузить настройки. Попробуйте ещё раз.");
  }
  return {
    settings: { ...settings.data, collection_menu_position: collectionMenuPosition(settings.data.collection_menu_position) },
    payment: { shopId: payment.data.yookassa_shop_id, keySaved: Boolean(payment.data.yookassa_secret_key) },
    prices: Object.fromEntries((prices.data ?? []).map((row) => [row.artwork_id, row.price])) as Record<string, number | null>,
    orders: orders.data ?? [],
  };
}

export async function saveAdminSetting(key: "show_prices" | "online_payment_enabled" | "show_style_filter", value: boolean) {
  const change = { [key]: value } as { show_prices?: boolean; online_payment_enabled?: boolean; show_style_filter?: boolean };
  const { data, error } = await supabase.from("site_settings").update({ ...change, updated_at: new Date().toISOString() }).eq("id", 1).select("id").single();
  if (error || !data) throw new Error("Настройка не сохранена. Попробуйте ещё раз.");
}

export async function saveCollectionMenuPosition(position: CollectionMenuPosition) {
  const { data, error } = await supabase.from("site_settings").update({ collection_menu_position: position, updated_at: new Date().toISOString() }).eq("id", 1).select("id").single();
  if (error || !data) throw new Error("Расположение меню не сохранено. Попробуйте ещё раз.");
}

export async function saveCollectionDirections(directions: { key: string; ru: string; en: string; hidden: boolean }[]) {
  const { data, error } = await supabase.from("site_settings").update({ collection_directions: directions, updated_at: new Date().toISOString() }).eq("id", 1).select("id").single();
  if (error || !data) throw new Error("Направления не сохранены. Попробуйте ещё раз.");
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
export async function loadAdminArtworks() {
  const { data, error } = await supabase.from("artworks").select("*").order("sort_order");
  if (error) throw new Error("Не удалось загрузить картины.");
  return data as import("@/lib/artwork-rows").ArtworkRow[];
}

export type ArtworkPatch = Partial<Pick<import("@/lib/artwork-rows").ArtworkRow, "title_ru" | "title_en" | "category" | "categories" | "year" | "size" | "medium_ru" | "medium_en" | "hidden" | "source_availability" | "sort_order" | "project_id" | "interior_enabled" | "genre" | "style">>;

export async function saveAdminArtwork(id: string, patch: ArtworkPatch) {
  const { data, error } = await supabase.from("artworks").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id).select("id").single();
  if (error || !data) throw new Error("Картина не сохранена. Попробуйте ещё раз.");
}

export async function deleteAdminArtwork(id: string) {
  const { error } = await supabase.from("artworks").delete().eq("id", id);
  if (error) throw new Error("Картина не удалена. Попробуйте ещё раз.");
}

export async function loadAdminProjects(): Promise<Project[]> {
  const { data, error } = await supabase.from("projects").select("*").order("sort_order");
  if (error) throw new Error("Не удалось загрузить спецпроекты.");
  return data as Project[];
}

export type ProjectPatch = Partial<Pick<Project, "title_ru" | "title_en" | "description_ru" | "description_en" | "year" | "kind" | "interior_enabled" | "cover_artwork_id" | "sort_order">>;
export async function saveAdminProject(id: string, patch: ProjectPatch) {
  const { data, error } = await supabase.from("projects").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id).select("id").single();
  if (error || !data) throw new Error("Проект не сохранён. Попробуйте ещё раз.");
}

export async function createAdminProject(title: string) {
  const { data, error } = await supabase.from("projects").insert({ id: crypto.randomUUID(), title_ru: title.trim(), sort_order: 100 }).select("id").single();
  if (error || !data) throw new Error("Проект не создан. Попробуйте ещё раз.");
}

export async function saveSiteJson(key: "genres" | "styles" | "cv", value: unknown) {
  const { data, error } = await supabase.from("site_settings").update({ [key]: value, updated_at: new Date().toISOString() } as unknown as { updated_at: string }).eq("id", 1).select("id").single();
  if (error || !data) throw new Error("Изменения не сохранены. Попробуйте ещё раз.");
}

export type AdminUser = { id: string; email: string; created_at: string; last_sign_in_at: string | null; roles: string[] };
export async function loadAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase.rpc("admin_list_users");
  if (error) throw new Error("Не удалось загрузить пользователей.");
  return (data ?? []) as AdminUser[];
}
export async function setAdminUserRole(userId: string, role: "admin" | "user", on: boolean) {
  const { error } = await supabase.rpc("admin_set_role", { _user_id: userId, _role: role, _on: on });
  if (error) throw new Error(error.message.includes("own admin") ? "Нельзя снять роль администратора с себя." : "Не удалось изменить роль.");
}
