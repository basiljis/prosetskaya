import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { BACKEND_SERVER_URL, BACKEND_PUBLIC_KEY, backendFetch } from "./config";

export function publicBackend() {
  return createClient<Database>(BACKEND_SERVER_URL, BACKEND_PUBLIC_KEY, {
    global: { fetch: backendFetch(BACKEND_PUBLIC_KEY) },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
function adminBackend() {
  // Independent hosting must supply this private key; never fall back to a managed Cloud key.
  const key = process.env["EXTERNAL_SUPABASE_SECRET_KEY"];
  if (!key) throw new Error("Для приглашений и онлайн-оплаты задайте EXTERNAL_SUPABASE_SECRET_KEY на хостинге.");
  return createClient<Database>(BACKEND_SERVER_URL, key, {
    global: { fetch: backendFetch(key) }, auth: { persistSession: false, autoRefreshToken: false },
  });
}
export const supabaseAdmin = new Proxy({} as ReturnType<typeof adminBackend>, {
  get(_, prop) { const client = adminBackend(); return Reflect.get(client, prop, client); },
});
