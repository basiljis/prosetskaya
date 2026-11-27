import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/backend/auth-middleware";

const orderSchema = z.object({
  artworkId: z.string().min(1).max(80),
  artworkTitle: z.string().min(1).max(200),
  method: z.enum(["invoice", "online"]),
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(5).max(30),
  email: z.string().trim().email().max(255),
  company: z.string().trim().max(200).default(""),
  comment: z.string().trim().max(1000).default(""),
  returnUrl: z.string().url().max(500),
});

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.input<typeof orderSchema>) => orderSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const [{ data: settings }, { data: price }] = await Promise.all([
      supabase.from("site_settings").select("show_prices, online_payment_enabled").eq("id", 1).single(),
      supabase.from("artwork_prices").select("price").eq("artwork_id", data.artworkId).maybeSingle(),
    ]);
    const amount = price?.price ?? null;
    if (data.method === "online" && (!settings?.online_payment_enabled || !amount)) {
      return { ok: false as const, error: "Онлайн-оплата для этой работы пока недоступна. Выберите оформление по договору и счёту." };
    }
    const { data: order, error } = await supabase.from("orders").insert({
      user_id: userId, artwork_id: data.artworkId, artwork_title: data.artworkTitle, method: data.method,
      amount, customer_name: data.name, customer_phone: data.phone, customer_email: data.email,
      company: data.company, comment: data.comment,
    }).select("id").single();
    if (error || !order) {
      return { ok: false as const, error: error?.code === "23505" ? "Эту работу уже заказали." : "Не удалось оформить заказ. Попробуйте ещё раз." };
    }
    if (data.method === "invoice") return { ok: true as const, orderId: order.id };

    const { supabaseAdmin } = await import("@/lib/backend/client.server");
    const { data: creds } = await supabaseAdmin.from("payment_settings").select("yookassa_shop_id, yookassa_secret_key").eq("id", 1).single();
    if (!creds?.yookassa_shop_id || !creds.yookassa_secret_key) {
      await supabaseAdmin.from("orders").update({ status: "cancelled" }).eq("id", order.id);
      return { ok: false as const, error: "Онлайн-оплата ещё не настроена. Выберите оформление по договору и счёту." };
    }
    const res = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotence-Key": order.id,
        Authorization: "Basic " + btoa(`${creds.yookassa_shop_id}:${creds.yookassa_secret_key}`),
      },
      body: JSON.stringify({
        amount: { value: amount!.toFixed(2), currency: "RUB" },
        capture: true,
        confirmation: { type: "redirect", return_url: data.returnUrl },
        description: `Картина «${data.artworkTitle}»`.slice(0, 128),
        metadata: { order_id: order.id },
      }),
    });
    const payment = (await res.json()) as { id?: string; confirmation?: { confirmation_url?: string } };
    if (!res.ok || !payment.id || !payment.confirmation?.confirmation_url) {
      await supabaseAdmin.from("orders").update({ status: "cancelled" }).eq("id", order.id);
      return { ok: false as const, error: "Платёжная система не ответила. Попробуйте позже или выберите оплату по счёту." };
    }
    await supabaseAdmin.from("orders").update({ payment_id: payment.id, status: "awaiting_payment" }).eq("id", order.id);
    return { ok: true as const, orderId: order.id, paymentUrl: payment.confirmation.confirmation_url };
  });
