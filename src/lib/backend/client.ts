import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { BACKEND_URL, BACKEND_PUBLIC_KEY, backendFetch } from "./config";

// Independent auth storage: never restore a Lovable Cloud token against the new database.
export const supabase = createClient<Database>(BACKEND_URL, BACKEND_PUBLIC_KEY, {
  global: { fetch: backendFetch(BACKEND_PUBLIC_KEY) },
  auth: { persistSession: true, autoRefreshToken: true, storageKey: "prosetskaya-independent-auth" },
});
