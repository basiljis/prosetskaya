import { createFileRoute } from "@tanstack/react-router";
import { SimplePage } from "@/components/simple-page";
import { boutique } from "@/lib/boutique";

export const Route = createFileRoute("/delivery")({
  head: () => ({ meta: [
    { property: "og:url", content: "https://prosetskaya.lovable.app/delivery" },
    { title: "Условия доставки — Юлия Просецкая" },
    { name: "description", content: "Доставка картин Юлии Просецкой по Москве, России и за границу: сроки и способы." },
    { property: "og:title", content: "Условия доставки картин" },
    { property: "og:description", content: "Сроки и способы доставки по России и миру." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ], links: [{ rel: "canonical", href: "https://prosetskaya.lovable.app/delivery" }] }),
  component: () => <SimplePage title="Условия доставки" kicker="Покупка"><ul className="mt-10 border-t border-border">{boutique.ru.deliveryItems.map((d) => <li key={d} className="border-b border-border py-4 text-sm leading-7">{d}</li>)}</ul></SimplePage>,
});
