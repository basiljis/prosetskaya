import artwork0 from "@/assets/prosetskaya/reflection.jpg.asset.json";
import artwork1 from "@/assets/prosetskaya/my-world.jpg.asset.json";
import artwork2 from "@/assets/prosetskaya/anniversary-bouquet.jpg.asset.json";
import artwork3 from "@/assets/prosetskaya/bright-soul.jpg.asset.json";
import artwork4 from "@/assets/prosetskaya/girl-flamingo.jpg.asset.json";
import artwork5 from "@/assets/prosetskaya/dancer.jpg.asset.json";
import artwork6 from "@/assets/prosetskaya/daisies.jpg.asset.json";
import artwork7 from "@/assets/prosetskaya/silence.jpg.asset.json";
import artwork8 from "@/assets/prosetskaya/cape-fiolent.jpg.asset.json";
import artwork9 from "@/assets/prosetskaya/crimean-vineyards.jpg.asset.json";
import artwork10 from "@/assets/prosetskaya/ural-river.jpg.asset.json";
import artwork11 from "@/assets/prosetskaya/time.jpg.asset.json";
import artwork12 from "@/assets/prosetskaya/pink-rain.jpg.asset.json";
import artwork13 from "@/assets/prosetskaya/flower-world.jpg.asset.json";
import artwork14 from "@/assets/prosetskaya/suvorovsky-lane.jpg.asset.json";
import artwork15 from "@/assets/prosetskaya/bakhchisaray.jpg.asset.json";
import artwork16 from "@/assets/prosetskaya/fluorescent-5.jpg.asset.json";

export type Lang = "ru" | "en";
export type Category = "all" | "painting" | "landscape" | "digital" | "graphics" | "fluorescent";
export interface Artwork {
  id: string; image: string; source: string; ru: string; en: string;
  category: Exclude<Category, "all">; year: string; size: string;
  mediumRu: string; mediumEn: string; width: number; height: number;
}

export const artworks: readonly Artwork[] = [
  {"id": "reflection", "source": "https://prosetskaya.ru/zhivopis", "ru": "В отражении", "en": "In Reflection", "category": "painting", "year": "2020", "size": "120 × 120", "mediumRu": "Холст, масло", "mediumEn": "Oil on canvas", "width": 1920, "height": 1920, "image": artwork0.url},
  {"id": "my-world", "source": "https://prosetskaya.ru/zhivopis", "ru": "Мой мир", "en": "My World", "category": "painting", "year": "2021", "size": "80 × 100", "mediumRu": "Холст, масло", "mediumEn": "Oil on canvas", "width": 1522, "height": 1920, "image": artwork1.url},
  {"id": "anniversary-bouquet", "source": "https://prosetskaya.ru/zhivopis", "ru": "Юбилейный букет", "en": "Anniversary Bouquet", "category": "painting", "year": "2020", "size": "100 × 120", "mediumRu": "Холст, масло", "mediumEn": "Oil on canvas", "width": 1073, "height": 1280, "image": artwork2.url},
  {"id": "bright-soul", "source": "https://prosetskaya.ru/zhivopis", "ru": "Светлая душа", "en": "Bright Soul", "category": "painting", "year": "2021", "size": "100 × 150", "mediumRu": "Холст, масло", "mediumEn": "Oil on canvas", "width": 886, "height": 1280, "image": artwork3.url},
  {"id": "girl-flamingo", "source": "https://prosetskaya.ru/zhivopis", "ru": "Девушка с фламинго", "en": "Girl with a Flamingo", "category": "painting", "year": "2020", "size": "110 × 120", "mediumRu": "Холст, масло", "mediumEn": "Oil on canvas", "width": 1280, "height": 1189, "image": artwork4.url},
  {"id": "dancer", "source": "https://prosetskaya.ru/zhivopis", "ru": "Танцовщица", "en": "The Dancer", "category": "painting", "year": "2012", "size": "160 × 120", "mediumRu": "Холст, масло", "mediumEn": "Oil on canvas", "width": 1920, "height": 1434, "image": artwork5.url},
  {"id": "daisies", "source": "https://prosetskaya.ru/zhivopis", "ru": "Ромашки", "en": "Daisies", "category": "painting", "year": "2015", "size": "70 × 85", "mediumRu": "Холст, масло", "mediumEn": "Oil on canvas", "width": 1920, "height": 1566, "image": artwork6.url},
  {"id": "silence", "source": "https://prosetskaya.ru/zhivopis", "ru": "Тишина", "en": "Silence", "category": "painting", "year": "2014", "size": "120 × 100", "mediumRu": "Холст, масло", "mediumEn": "Oil on canvas", "width": 1597, "height": 1920, "image": artwork7.url},
  {"id": "cape-fiolent", "source": "https://prosetskaya.ru/pejzazhi", "ru": "Мыс Фиолент", "en": "Cape Fiolent", "category": "landscape", "year": "2021", "size": "50 × 60", "mediumRu": "Холст, масло", "mediumEn": "Oil on canvas", "width": 1920, "height": 1585, "image": artwork8.url},
  {"id": "crimean-vineyards", "source": "https://prosetskaya.ru/pejzazhi", "ru": "Виноградники в Крыму", "en": "Crimean Vineyards", "category": "landscape", "year": "2021", "size": "50 × 70", "mediumRu": "Холст, масло", "mediumEn": "Oil on canvas", "width": 1920, "height": 1372, "image": artwork9.url},
  {"id": "ural-river", "source": "https://prosetskaya.ru/pejzazhi", "ru": "Река Урал", "en": "The Ural River", "category": "landscape", "year": "2020", "size": "30 × 40", "mediumRu": "Холст, масло", "mediumEn": "Oil on canvas", "width": 1920, "height": 1407, "image": artwork10.url},
  {"id": "time", "source": "https://prosetskaya.ru/cifrovoe-iskusstvo", "ru": "Время", "en": "Time", "category": "digital", "year": "2021", "size": "", "mediumRu": "Цифровое искусство", "mediumEn": "Digital art", "width": 320, "height": 320, "image": artwork11.url},
  {"id": "pink-rain", "source": "https://prosetskaya.ru/cifrovoe-iskusstvo", "ru": "Розовый дождь", "en": "Pink Rain", "category": "digital", "year": "2023", "size": "", "mediumRu": "Цифровое искусство", "mediumEn": "Digital art", "width": 1493, "height": 1920, "image": artwork12.url},
  {"id": "flower-world", "source": "https://prosetskaya.ru/cifrovoe-iskusstvo", "ru": "Цветочный мир", "en": "Flower World", "category": "digital", "year": "2023", "size": "", "mediumRu": "Цифровое искусство", "mediumEn": "Digital art", "width": 1493, "height": 1920, "image": artwork13.url},
  {"id": "suvorovsky-lane", "source": "https://prosetskaya.ru/grafika-i-akvarel", "ru": "Суворовский переулок", "en": "Suvorovsky Lane", "category": "graphics", "year": "2006", "size": "35 × 45", "mediumRu": "Графика", "mediumEn": "Graphics", "width": 763, "height": 1024, "image": artwork14.url},
  {"id": "bakhchisaray", "source": "https://prosetskaya.ru/grafika-i-akvarel", "ru": "Бахчисарай", "en": "Bakhchisaray", "category": "graphics", "year": "2005", "size": "40 × 30", "mediumRu": "Картон, пастель", "mediumEn": "Pastel on cardboard", "width": 671, "height": 1024, "image": artwork15.url},
  {"id": "fluorescent-5", "source": "https://prosetskaya.ru/fluorescentnye-raboty", "ru": "Флуоресцентная работа № 5", "en": "Fluorescent Work No. 5", "category": "fluorescent", "year": "", "size": "", "mediumRu": "Флуоресцентная работа", "mediumEn": "Fluorescent artwork", "width": 1011, "height": 1024, "image": artwork16.url}
];

export const artist = {
  email: "prosetskaya.juliya@gmail.com",
  phone: "+7 (909) 156-56-40",
  phoneHref: "tel:+79091565640",
  secondaryPhone: "+7 (910) 510-10-61",
  telegram: "https://t.me/yuliya_prosetskaya",
  instagram: "https://www.instagram.com/yulia_prosetskaya/",
  whatsapp: "https://wa.me/79091565640",
  source: "https://prosetskaya.ru/",
} as const;

export const categories: readonly Category[] = ["all", "painting", "landscape", "digital", "graphics", "fluorescent"];
export const featuredIds = ["reflection", "my-world", "girl-flamingo"] as const;
