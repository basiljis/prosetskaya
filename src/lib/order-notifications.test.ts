import { expect, it } from "vitest";
import { unreadOrders } from "./order-notifications";
const orders = [{ id: "1", artwork_title: "Картина", status: "awaiting_payment", created_at: "2026-11-24T00:00:00Z", updated_at: "2026-11-25T00:00:00Z", customer_name: "Покупатель" }];
it("notifies the buyer of a changed status", () => { expect(unreadOrders(orders, false, "2026-11-24T12:00:00Z")).toHaveLength(1); expect(unreadOrders(orders, false, "2026-11-26T00:00:00Z")).toHaveLength(0); });
it("only new requests appear as unread for admins", () => { expect(unreadOrders(orders, true, "")).toHaveLength(0); expect(unreadOrders([{ ...orders[0], id: "2", artwork_title: "Новая картина", customer_name: "Покупатель", status: "new", created_at: "2026-11-25T00:00:00Z", updated_at: "2026-11-25T00:00:00Z" }], true, "")).toHaveLength(1); });
