import { createFileRoute } from "@tanstack/react-router";
import { SimplePage } from "@/components/simple-page";
import { boutique } from "@/lib/boutique";

export const Route = createFileRoute("/requisites")({
  head: () => ({ meta: [
    { property: "og:url", content: "https://prosetskaya.lovable.app/requisites" },
    { title: "Реквизиты — Юлия Просецкая" },
    { name: "description", content: "Реквизиты ИП Просецкой Юлии Викторовны для оплаты работ по счёту." },
    { property: "og:title", content: "Реквизиты для оплаты" },
    { property: "og:description", content: "Банковские реквизиты ИП для оплаты по договору." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ], links: [{ rel: "canonical", href: "https://prosetskaya.lovable.app/requisites" }] }),
  component: () => <SimplePage title="Реквизиты" kicker="Покупка"><p className="mt-4 text-xs text-muted-foreground">{boutique.ru.legal}</p><ul className="mt-8 border-t border-border">{boutique.ru.requisiteItems.map((d) => <li key={d} className="border-b border-border py-4 text-sm tabular-nums">{d}</li>)}</ul></SimplePage>,
});
