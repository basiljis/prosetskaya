import { describe, expect, it } from "vitest";
import { buildNewsletterHtml } from "./newsletter";
const n = { kind: "exhibition" as const, title_ru: "Выставка <Весна>", title_en: "", body_ru: "Первый\nВторой", body_en: "", image_url: "", event_date: "1 мая" };
describe("newsletter", () => {
  it("escapes text and falls back to Russian title", () => {
    const html = buildNewsletterHtml(n, "en", "https://x.ru");
    expect(html).toContain("Выставка &lt;Весна&gt;");
    expect(html).not.toContain("<Весна>");
  });
  it("splits paragraphs and includes signature and unsubscribe note", () => {
    const html = buildNewsletterHtml(n, "ru", "https://x.ru");
    expect(html.match(/<p style="margin:0 0 16px/g)?.length).toBe(2);
    expect(html).toContain("Отписаться можно в личном кабинете");
  });
});
