import logo from "@/assets/prosetskaya/logo.png.asset.json";
import signature from "@/assets/prosetskaya/signature.png.asset.json";
import { newsKind, type NewsItem } from "@/lib/news";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Newsletter letter in the gallery's editorial style: dark header with monogram, image, text, signature. */
export function buildNewsletterHtml(n: Pick<NewsItem, "kind" | "title_ru" | "title_en" | "body_ru" | "body_en" | "image_url" | "event_date">, lang: "ru" | "en", siteUrl: string) {
  const ru = lang === "ru";
  const title = esc(ru ? n.title_ru : n.title_en || n.title_ru);
  const body = esc(ru ? n.body_ru : n.body_en || n.body_ru).split(/\n+/).filter(Boolean).map((p) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#3a3633">${p}</p>`).join("");
  const name = ru ? "Юлия Просецкая" : "Yulia Prosetskaya";
  return `<!doctype html><html><body style="margin:0;background:#ebe8e3;font-family:Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ebe8e3;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff">
<tr><td style="background:#151413;padding:28px 40px"><table role="presentation" width="100%"><tr>
<td><img src="${logo.url}" alt="${name}" height="44" style="display:block;height:44px"></td>
<td align="right" style="color:#f2efea;font-size:13px;letter-spacing:.04em">${name}</td></tr></table></td></tr>
${n.image_url ? `<tr><td><img src="${esc(n.image_url)}" alt="" width="600" style="display:block;width:100%;height:auto"></td></tr>` : ""}
<tr><td style="padding:36px 40px 8px">
<p style="margin:0 0 12px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#7a1f2b">${esc(newsKind[n.kind][lang])}${n.event_date ? ` · ${esc(n.event_date)}` : ""}</p>
<h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:32px;line-height:1.2;color:#151413">${title}</h1>
${body}
<p style="margin:28px 0 0"><a href="${esc(siteUrl)}" style="color:#151413;font-size:13px;text-decoration:none;border-bottom:1px solid #151413;padding-bottom:4px">${ru ? "Смотреть на сайте" : "View on the website"} &#8599;</a></p>
</td></tr>
<tr><td style="padding:24px 40px 36px"><img src="${signature.url}" alt="${name}" height="64" style="display:block;height:64px"></td></tr>
<tr><td style="border-top:1px solid #e4e0da;padding:18px 40px;font-size:11px;line-height:1.6;color:#8a847d">${ru ? "Вы получили это письмо, потому что подписались на новости на сайте художника. Отписаться можно в личном кабинете." : "You receive this because you subscribed on the artist's website. Unsubscribe in your account."}</td></tr>
</table></td></tr></table></body></html>`;
}
