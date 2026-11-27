import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/backend/auth-middleware";

const schema = z.object({ email: z.string().trim().email().max(255), admin: z.boolean(), origin: z.string().url() });

/** Invite only after verifying the caller as admin. No automatic email confirmation or shared password. */
export const createUserAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.input<typeof schema>) => schema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) return { ok: false as const, error: "Только администратор может добавлять пользователей." };
    const { supabaseAdmin } = await import("@/lib/backend/client.server");
    const requestOrigin = (await import("@tanstack/react-start/server")).getRequest().headers.get("origin");
    if (!requestOrigin || requestOrigin !== new URL(data.origin).origin) return { ok: false as const, error: "Не удалось проверить адрес сайта." };
    const { data: created, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email.toLowerCase(), { redirectTo: `${requestOrigin}/reset-password` });
    if (error || !created.user) return { ok: false as const, error: error?.message.includes("already") ? "Пользователь с такой почтой уже есть." : "Не удалось создать пользователя." };
    if (data.admin) {
      const { error: roleError } = await context.supabase.rpc("admin_set_role", { _user_id: created.user.id, _role: "admin", _on: true });
      if (roleError) return { ok: false as const, error: "Приглашение отправлено, но роль не сохранена. Назначьте её в списке пользователей." };
    }
    return { ok: true as const };
  });
