import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { supabase } from "@/lib/backend/client";
import { deviceOf } from "@/lib/visits";

/** Records one anonymous page visit per route change; admin pages are skipped. */
export function VisitTracker() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    if (path.startsWith("/admin") || path.startsWith("/account")) return;
    let id = localStorage.getItem("visitor-id");
    if (!id) { id = crypto.randomUUID(); localStorage.setItem("visitor-id", id); }
    const ref = document.referrer && !document.referrer.startsWith(location.origin) ? document.referrer.slice(0, 300) : "";
    void supabase.from("page_views").insert({ path: path.slice(0, 300), referrer: ref, device: deviceOf(window.innerWidth), visitor_id: id }).then(() => undefined);
  }, [path]);
  return null;
}
