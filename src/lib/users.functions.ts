import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({ email: z.string().trim().email().max(255), password: z.string().min(8).max(72), admin: z.boolean() });

/** Admin creates an account with a confirmed email; admin role checked as the caller before using the privileged client. */
export const createUserAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.input<typeof schema>) => schema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) return { ok: false as const, error: "Только администратор может добавлять пользователей." };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({ email: data.email.toLowerCase(), password: data.password, email_confirm: true });
    if (error || !created.user) return { ok: false as const, error: error?.message.includes("already") ? "Пользователь с такой почтой уже есть." : "Не удалось создать пользователя." };
    if (data.admin) await supabaseAdmin.from("user_roles").upsert({ user_id: created.user.id, role: "admin" }, { onConflict: "user_id,role" });
    return { ok: true as const };
  });
