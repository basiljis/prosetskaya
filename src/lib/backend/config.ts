/** Public defaults target the independent database; private keys are runtime-only. */
export const BACKEND_SERVER_URL = "https://pgssrcadvcwxmvuhfozu.supabase.co";
export const BACKEND_URL = import.meta.env["VITE_EXTERNAL_SUPABASE_URL"] || BACKEND_SERVER_URL;
export const BACKEND_PUBLIC_KEY = "sb_publishable_5Xt3q4k4_rnribyIVuTVTQ_DWC-GK1m";
export function backendFetch(key: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(input instanceof Request ? input.headers : undefined);
    new Headers(init?.headers).forEach((v, k) => headers.set(k, v));
    if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  };
}
