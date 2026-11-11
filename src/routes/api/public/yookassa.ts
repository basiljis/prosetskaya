import { createFileRoute } from "@tanstack/react-router";

// YooKassa notification. We never trust the body: the payment is re-read from YooKassa with our own credentials.
export const Route = createFileRoute("/api/public/yookassa")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => null)) as { object?: { id?: string } } | null;
        const paymentId = body?.object?.id;
        if (!paymentId || !/^[\w-]{10,64}$/.test(paymentId)) return new Response("bad request", { status: 400 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: order } = await supabaseAdmin.from("orders").select("id").eq("payment_id", paymentId).maybeSingle();
        if (!order) return new Response("ok");
        const { data: creds } = await supabaseAdmin.from("payment_settings").select("yookassa_shop_id, yookassa_secret_key").eq("id", 1).single();
        if (!creds?.yookassa_shop_id) return new Response("ok");
        const res = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
          headers: { Authorization: "Basic " + btoa(`${creds.yookassa_shop_id}:${creds.yookassa_secret_key}`) },
        });
        if (!res.ok) return new Response("retry", { status: 502 });
        const payment = (await res.json()) as { status?: string };
        if (payment.status === "succeeded") await supabaseAdmin.from("orders").update({ status: "paid" }).eq("id", order.id);
        if (payment.status === "canceled") await supabaseAdmin.from("orders").update({ status: "cancelled" }).eq("id", order.id);
        return new Response("ok");
      },
    },
  },
});
