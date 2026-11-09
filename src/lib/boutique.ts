import type { Artwork, Lang } from "@/lib/artworks";

/** Wall width shown in the room preview, in centimetres. */
export const ROOM_WALL_CM = 360;

/** Real artwork width/height in cm, using the catalogue size and the photo's proportions. */
export function artworkSizeCm(work: Pick<Artwork, "size" | "width" | "height">): { w: number; h: number } {
  const numbers = work.size.split(/[×x]/).map((part) => Number.parseFloat(part.replace(",", "."))).filter((n) => Number.isFinite(n) && n > 0);
  const longSide = numbers.length ? Math.max(...numbers) : 60;
  const ratio = work.width / work.height;
  return ratio >= 1 ? { w: longSide, h: Math.round(longSide / ratio) } : { w: Math.round(longSide * ratio), h: longSide };
}

export type Availability = "original" | "print";
export function availability(work: Pick<Artwork, "category">): Availability {
  return work.category === "digital" ? "print" : "original";
}

export function inquiryText(work: Pick<Artwork, "ru" | "en" | "year" | "size">, lang: Lang, name: string, message: string) {
  const title = `${work[lang]}${work.year ? `, ${work.year}` : ""}${work.size ? `, ${work.size} см` : ""}`;
  const lines = lang === "ru"
    ? [`Здравствуйте, Юлия! Меня интересует работа «${title}».`, message, name && `— ${name}`]
    : [`Hello Yulia! I am interested in “${title}”.`, message, name && `— ${name}`];
  return lines.filter(Boolean).join("\n");
}

export const boutique = {
  ru: {
    room: "В интерьере", wall: "Картина", roomHint: "Масштаб по реальному размеру работы · стена 3,6 м",
    original: "Оригинал · цена по запросу", print: "Авторский принт под заказ",
    inquire: "Узнать о покупке", inquiryTitle: "Запрос о работе", inquiryText: "Юлия ответит лично: наличие, цена, доставка, оформление в раму и примерка в интерьере.",
    yourName: "Ваше имя", message: "Вопрос или пожелание", messagePlaceholder: "Например: подойдёт ли работа для гостиной, нужна ли рама, доставка в Санкт-Петербург",
    via: "Отправить через", email: "Почта",
    projectsLabel: "Спецпроекты", projectsTitle: "Живопись для пространств",
    projectsText: "Монументальные росписи и серии для общественных интерьеров — от спортивного комплекса до гостиничной сети.",
    projects: [
      { year: "2021", title: "Арт-проект «Лужники»", note: "Разработка и роспись для спортивного комплекса", href: "https://prosetskaya.ru/dlya-sportkompleksa" },
      { year: "—", title: "Серия для сети гостиниц", note: "Живопись для номеров и общественных зон", href: "https://prosetskaya.ru/dlya-seti-gostinic" },
      { year: "—", title: "Эскиз для «Тавриды»", note: "Разработка эскиза для арт-кластера", href: "https://prosetskaya.ru/razrabotka-eskiza-dlya-proekta-tavrida" },
      { year: "2019", title: "Рекорд России", note: "Самая большая картина-этюд маслом за час, 500 × 200 см", href: "https://iz.ru/875936/2019-05-07/zhitelnitca-kalugi-popala-v-knigu-rekordov-rossii" },
    ],
    commission: "Обсудить заказ",
    exhibitionsLabel: "Выставки", exhibitionsTitle: "Выставочная деятельность", allExhibitions: "Полный список выставок",
    exhibitions: [
      { year: "2022", title: "«Москва — Санкт-Петербург»", place: "Новая Третьяковка" },
      { year: "2020", title: "Групповая выставка", place: "Новая Третьяковка" },
      { year: "2019", title: "Выставка в Чунцине", place: "Чунцин, Китай" },
      { year: "2019", title: "Выставка в Хэйхэ", place: "Хэйхэ, Китай" },
      { year: "2018", title: "«Москва — любовь моя!»", place: "Кузнецкий мост, 20" },
      { year: "2018", title: "«Мир детства»", place: "ЦДХ, Москва" },
      { year: "2016", title: "Персональная выставка «Дуновение ветра»", place: "Калужский Дом музыки" },
      { year: "2016", title: "«Молодость России»", place: "ЦДХ, Москва" },
      { year: "2014", title: "Пятая персональная выставка", place: "Московское Суворовское училище" },
      { year: "2011", title: "«Москва глазами молодых», лауреат", place: "ЦДХ, Москва" },
    ],
    buyingLabel: "Покупка", buyingTitle: "Как купить картину",
    steps: [
      { title: "Запрос", note: "Выберите работу и напишите Юлии — в Telegram, WhatsApp или на почту." },
      { title: "Консультация", note: "Цена, наличие, рама, примерка по фото вашего интерьера." },
      { title: "Оплата", note: "По договору и счёту от ИП Просецкая Ю. В., банковским переводом." },
      { title: "Доставка", note: "По Москве и России за 1–7 рабочих дней, бережная упаковка. Сертификат подлинности." },
    ],
    delivery: "Условия доставки", requisites: "Реквизиты для оплаты",
    legal: "ИП Просецкая Юлия Викторовна · ИНН 400489570194 · ОГРНИП 314774610501033",
  },
  en: {
    room: "In a room", wall: "Artwork", roomHint: "Scaled to the real size of the work · 3.6 m wall",
    original: "Original · price on request", print: "Signed print on order",
    inquire: "Enquire to buy", inquiryTitle: "Artwork enquiry", inquiryText: "Yulia replies personally: availability, price, delivery, framing and fitting it to your interior.",
    yourName: "Your name", message: "Question or wish", messagePlaceholder: "E.g. will it suit a living room, is framing needed, delivery to Berlin",
    via: "Send via", email: "Email",
    projectsLabel: "Commissions", projectsTitle: "Painting for spaces",
    projectsText: "Murals and series for public interiors — from a sports arena to a hotel chain.",
    projects: [
      { year: "2021", title: "Luzhniki art project", note: "Design and painting for the sports complex", href: "https://prosetskaya.ru/dlya-sportkompleksa" },
      { year: "—", title: "Hotel chain series", note: "Paintings for rooms and public areas", href: "https://prosetskaya.ru/dlya-seti-gostinic" },
      { year: "—", title: "Sketch for Tavrida", note: "Design sketch for the art cluster", href: "https://prosetskaya.ru/razrabotka-eskiza-dlya-proekta-tavrida" },
      { year: "2019", title: "Russian record", note: "Largest oil study painted in one hour, 500 × 200 cm", href: "https://iz.ru/875936/2019-05-07/zhitelnitca-kalugi-popala-v-knigu-rekordov-rossii" },
    ],
    commission: "Discuss a commission",
    exhibitionsLabel: "Exhibitions", exhibitionsTitle: "Exhibition history", allExhibitions: "Full exhibition list",
    exhibitions: [
      { year: "2022", title: "“Moscow — Saint Petersburg”", place: "New Tretyakov Gallery" },
      { year: "2020", title: "Group exhibition", place: "New Tretyakov Gallery" },
      { year: "2019", title: "Exhibition in Chongqing", place: "Chongqing, China" },
      { year: "2019", title: "Exhibition in Heihe", place: "Heihe, China" },
      { year: "2018", title: "“Moscow, My Love!”", place: "Kuznetsky Most 20" },
      { year: "2018", title: "“World of Childhood”", place: "Central House of Artists, Moscow" },
      { year: "2016", title: "Solo show “Breath of Wind”", place: "Kaluga House of Music" },
      { year: "2016", title: "“Youth of Russia”", place: "Central House of Artists, Moscow" },
      { year: "2014", title: "Fifth solo exhibition", place: "Moscow Suvorov School" },
      { year: "2011", title: "“Moscow Through Young Eyes”, laureate", place: "Central House of Artists, Moscow" },
    ],
    buyingLabel: "Buying", buyingTitle: "How to buy a painting",
    steps: [
      { title: "Enquiry", note: "Pick a work and message Yulia via Telegram, WhatsApp or email." },
      { title: "Consultation", note: "Price, availability, framing, fitting to a photo of your room." },
      { title: "Payment", note: "Contract and invoice from the artist’s registered business, bank transfer." },
      { title: "Delivery", note: "Moscow and Russia in 1–7 working days, careful packing. Certificate of authenticity." },
    ],
    delivery: "Delivery terms", requisites: "Payment details",
    legal: "Sole proprietor Yulia V. Prosetskaya · INN 400489570194 · OGRNIP 314774610501033",
  },
} as const;
