import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { BACKEND_SERVER_URL, BACKEND_PUBLIC_KEY, backendFetch } from "./config";

export const requireSupabaseAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const header = getRequest().headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Error("Unauthorized");
  const token = header.slice(7);
  const client = createClient<Database>(BACKEND_SERVER_URL, BACKEND_PUBLIC_KEY, {
    global: { fetch: backendFetch(BACKEND_PUBLIC_KEY), headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) throw new Error("Unauthorized");
  return next({ context: { supabase: client, userId: data.user.id, claims: { sub: data.user.id, email: data.user.email } } });
});
