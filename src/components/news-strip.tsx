import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { newsKind, type NewsItem } from "@/lib/news";

/** Latest published news; each opens in a modal window. Hidden when there is no news. */
export function NewsStrip({ lang }: { lang: "ru" | "en" }) {
  const { data } = useQuery({ queryKey: ["news"], queryFn: async () => {
    const { data } = await supabase.from("news").select("*").eq("published", true).order("created_at", { ascending: false }).limit(6);
    return (data ?? []) as NewsItem[];
  }, staleTime: 60_000 });
  const [open, setOpen] = useState<NewsItem | null>(null);
  if (!data?.length) return null;
  const title = (n: NewsItem) => (lang === "en" && n.title_en) || n.title_ru;
  return <div className="mb-8 border-y border-border py-4">
    <p className="text-[10px] uppercase tracking-[0.2em] text-primary">{lang === "ru" ? "Новости" : "News"}</p>
    <ul className="mt-3 flex snap-x gap-6 overflow-x-auto pb-1">{data.map((n) => <li key={n.id} className="min-w-[240px] max-w-[320px] snap-start">
      <button type="button" onClick={() => setOpen(n)} className="group flex w-full gap-3 text-left">
        {n.image_url && <img src={n.image_url} alt="" className="size-14 shrink-0 object-cover" />}
        <span className="min-w-0"><span className="block text-[10px] text-muted-foreground">{newsKind[n.kind][lang]}{n.event_date ? ` · ${n.event_date}` : ""}</span><span className="mt-1 flex items-center gap-1 text-sm leading-5 group-hover:text-primary">{title(n)}<ArrowUpRight className="size-3 shrink-0" /></span></span>
      </button></li>)}</ul>
    <Dialog.Root open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
      <Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(92vw,640px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto bg-background p-6 md:p-8">
          {open && <>
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary">{newsKind[open.kind][lang]}{open.event_date ? ` · ${open.event_date}` : ""}</p>
            <Dialog.Title className="mt-3 font-display text-3xl leading-tight">{title(open)}</Dialog.Title>
            {open.image_url && <img src={open.image_url} alt="" className="mt-5 max-h-[50vh] w-full object-contain" />}
            <Dialog.Description className="mt-5 whitespace-pre-line text-sm leading-7">{(lang === "en" && open.body_en) || open.body_ru}</Dialog.Description>
          </>}
          <Dialog.Close className="absolute right-4 top-4" aria-label={lang === "ru" ? "Закрыть" : "Close"}><X /></Dialog.Close>
        </Dialog.Content></Dialog.Portal>
    </Dialog.Root>
  </div>;
}
