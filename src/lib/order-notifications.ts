export type OrderNotice = { id: string; artwork_title: string; status: string; updated_at: string; created_at: string; customer_name: string };
export function unreadOrders(rows: readonly OrderNotice[], admin: boolean, seen: string) {
  return rows.filter((o) => admin ? o.status === "new" && o.created_at > seen : o.updated_at > seen);
}
