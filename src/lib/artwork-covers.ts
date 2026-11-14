import coverCatalogue from "@/data/artwork-covers.json";
import image0 from "@/assets/prosetskaya/work-399af691b9bc.jpg.asset.json";
import image1 from "@/assets/prosetskaya/work-b00681bb6aa1.jpg.asset.json";
import image2 from "@/assets/prosetskaya/work-3ec9b0398e05.jpg.asset.json";

const images: Readonly<Record<string, string>> = {
  "work-399af691b9bc": image0.url,
  "work-b00681bb6aa1": image1.url,
  "work-3ec9b0398e05": image2.url,
};

export const artworkCovers = coverCatalogue.map((work) => {
  const image = images[work.id];
  if (!image) throw new Error(`Artwork image missing: ${work.id}`);
  return { ...work, image };
});
