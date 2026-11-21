import { createFileRoute, Link } from "@tanstack/react-router";
import { SimplePage } from "@/components/simple-page";
import { boutique } from "@/lib/boutique";

export const Route = createFileRoute("/buy")({
  head: () => ({ meta: [
    { property: "og:url", content: "https://prosetskaya.lovable.app/buy" },
    { title: "Как купить картину — Юлия Просецкая" },
    { name: "description", content: "Два способа купить работу Юлии Просецкой: по договору и счёту или онлайн-оплата на сайте." },
    { property: "og:title", content: "Как купить картину Юлии Просецкой" },
    { property: "og:description", content: "Покупка по договору и счёту или онлайн на сайте." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ], links: [{ rel: "canonical", href: "https://prosetskaya.lovable.app/buy" }] }),
  component: BuyPage,
});

function BuyPage() {
  const b = boutique.ru;
  return (
    <SimplePage title="Как купить картину" kicker="Покупка" wide>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="border border-border p-7"><p className="text-[10px] uppercase text-primary">Способ 1</p><h2 className="mt-2 font-display text-3xl">По договору и счёту</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">Оформите заказ на сайте — Юлия свяжется с вами, подготовит договор купли-продажи и счёт для физического или юридического лица. Подходит для компаний, интерьерных студий и крупных работ.</p></div>
        <div className="border border-border p-7"><p className="text-[10px] uppercase text-primary">Способ 2</p><h2 className="mt-2 font-display text-3xl">Онлайн на сайте</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">Оплата банковской картой или СБП через ЮKassa сразу при оформлении. После оплаты работа закрепляется за вами и появляется в личном кабинете.</p></div>
      </div>
      <ol className="mt-14 grid gap-8 border-t border-border pt-10 md:grid-cols-4">{b.steps.map((s, i) => <li key={s.title}><span className="text-[10px] text-primary">0{i + 1}</span><p className="mt-2 font-display text-xl">{s.title}</p><p className="mt-2 text-xs leading-6 text-muted-foreground">{s.note}</p></li>)}</ol>
      <p className="mt-14 text-sm">Нажмите «Купить» у понравившейся работы в <Link to="/" hash="works" className="border-b border-foreground">галерее</Link>. Условия — в разделах <Link to="/delivery" className="border-b border-foreground">Доставка</Link> и <Link to="/requisites" className="border-b border-foreground">Реквизиты</Link>.</p>
    </SimplePage>
  );
}
