import type { Artwork, Lang } from "@/lib/artworks";

/** Wall width shown in the room preview, in centimetres. */
export const ROOMS = [
  { id: "living", ru: "Гостиная", en: "Living room", wallCm: 470, bottomPct: 52, furniture: { ru: "Диван 240 × 95 см", en: "Sofa 240 × 95 cm" }, portrait: { wallCm: 300, bottomPct: 46 } },
  { id: "dining", ru: "Столовая", en: "Dining room", wallCm: 398, bottomPct: 46, furniture: { ru: "Консоль 180 × 80 см", en: "Console 180 × 80 cm" }, portrait: { wallCm: 250, bottomPct: 43 } },
] as const;

/** Real artwork width/height in cm, using the catalogue size and the photo's proportions. */
export function artworkSizeCm(work: Pick<Artwork, "size" | "width" | "height">): { w: number; h: number } {
  const numbers = work.size.split(/[×x]/).map((part) => Number.parseFloat(part.replace(",", "."))).filter((n) => Number.isFinite(n) && n > 0);
  const longSide = numbers.length ? Math.max(...numbers) : 60;
  const ratio = work.width / work.height;
  return ratio >= 1 ? { w: longSide, h: Math.round(longSide / ratio) } : { w: Math.round(longSide * ratio), h: longSide };
}

/** Extra lift (in cm) for smaller works so they don't sit right on the furniture: up to 24 cm for tiny pieces, none from 80 cm tall. */
export function hangLiftCm(heightCm: number): number {
  return Math.round(Math.min(24, Math.max(0, (80 - heightCm) * 0.4)));
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
    room: "В интерьере", wall: "Картина", roomHint: "Масштаб по реальному размеру работы",
    original: "Оригинал · цена по запросу", print: "Авторский принт под заказ",
    inquire: "Узнать о покупке", inquiryTitle: "Запрос о работе", inquiryText: "Юлия ответит лично: наличие, цена, доставка, оформление в раму и примерка в интерьере.",
    yourName: "Ваше имя", message: "Вопрос или пожелание", messagePlaceholder: "Например: подойдёт ли работа для гостиной, нужна ли рама, доставка в Санкт-Петербург",
    via: "Отправить через", email: "Почта",
    projectsLabel: "Спецпроекты", projectsTitle: "Живопись для пространств",
    projectsText: "Монументальные росписи и серии для общественных интерьеров — от спортивного комплекса до гостиничной сети.",
    projects: [
      { kind: "painting", year: "2021", title: "Арт-проект «Лужники»", note: "Разработка и роспись для спортивного комплекса: динамичные сюжеты о спорте и движении.", source: "dlya-sportkompleksa" },
      { kind: "painting", year: "—", title: "Эскиз для «Тавриды»", note: "Разработка живописного эскиза для арт-кластера «Таврида».", source: "razrabotka-eskiza-dlya-proekta-tavrida" },
      { kind: "painting", year: "—", title: "Индивидуальные проекты", note: "Живопись по заказу для частных интерьеров.", source: "individualnye-proekty" },
      { kind: "photo", year: "—", title: "Серия для сети гостиниц", note: "Фотографии живописи в номерах и общественных зонах гостиниц.", source: "dlya-seti-gostinic" },
      { kind: "photo", year: "2019", title: "Рекорд России", note: "Фотографии с создания самой большой картины-этюда маслом за час, 500 × 200 см.", source: "proekty" },
    ],
    projectKinds: { painting: "Картины", photo: "Фотографии" }, projectOpen: "Смотреть", projectWorks: "изобр.",
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
    deliveryItems: ["Москва и Россия — от 1 до 7 рабочих дней, по договорённости по телефону +7 (910) 510-10-61", "За границу — от 7 дней, индивидуально", "Почта России — от 2 дней", "СДЭК"],
    requisiteItems: ["Банк получателя: Ярославский филиал ПАО «Промсвязьбанк»", "БИК 047888760", "Корр. счёт 30101810300000000760", "Получатель: Просецкая Юлия Викторовна", "Расчётный счёт 40802810602000119645", "Банковская карта: 2204 8802 0522 0432", "Другой способ оплаты — по телефону +7 (910) 510-10-61"],
    legal: "ИП Просецкая Юлия Викторовна · ИНН 400489570194 · ОГРНИП 314774610501033",
  },
  en: {
    room: "In a room", wall: "Artwork", roomHint: "Scaled to the real size of the work",
    original: "Original · price on request", print: "Signed print on order",
    inquire: "Enquire to buy", inquiryTitle: "Artwork enquiry", inquiryText: "Yulia replies personally: availability, price, delivery, framing and fitting it to your interior.",
    yourName: "Your name", message: "Question or wish", messagePlaceholder: "E.g. will it suit a living room, is framing needed, delivery to Berlin",
    via: "Send via", email: "Email",
    projectsLabel: "Commissions", projectsTitle: "Painting for spaces",
    projectsText: "Murals and series for public interiors — from a sports arena to a hotel chain.",
    projects: [
      { kind: "painting", year: "2021", title: "Luzhniki art project", note: "Design and painting for a sports complex: dynamic scenes of sport and motion.", source: "dlya-sportkompleksa" },
      { kind: "painting", year: "—", title: "Sketch for Tavrida", note: "Painted sketch for the Tavrida art cluster.", source: "razrabotka-eskiza-dlya-proekta-tavrida" },
      { kind: "painting", year: "—", title: "Private commissions", note: "Commissioned paintings for private interiors.", source: "individualnye-proekty" },
      { kind: "photo", year: "—", title: "Hotel chain series", note: "Photographs of paintings in hotel rooms and public areas.", source: "dlya-seti-gostinic" },
      { kind: "photo", year: "2019", title: "Russian record", note: "Photographs of the largest one-hour oil study, 500 × 200 cm.", source: "proekty" },
    ],
    projectKinds: { painting: "Paintings", photo: "Photographs" }, projectOpen: "View", projectWorks: "images",
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
    deliveryItems: ["Moscow and Russia — 1 to 7 working days, arranged by phone +7 (910) 510-10-61", "Abroad — from 7 days, individually", "Russian Post — from 2 days", "CDEK courier"],
    requisiteItems: ["Bank: Yaroslavl branch of PJSC Promsvyazbank", "BIC 047888760", "Corr. account 30101810300000000760", "Recipient: Yulia Viktorovna Prosetskaya", "Account 40802810602000119645", "Bank card: 2204 8802 0522 0432", "Other payment methods — call +7 (910) 510-10-61"],
    legal: "Sole proprietor Yulia V. Prosetskaya · INN 400489570194 · OGRNIP 314774610501033",
  },
} as const;
