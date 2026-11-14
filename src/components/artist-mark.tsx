import logo from "@/assets/prosetskaya/logo.png.asset.json";
import signature from "@/assets/prosetskaya/signature.png.asset.json";
import { cn } from "@/lib/utils";

export function ArtistMark({ kind = "logo", inverse = false, className, alt }: { kind?: "logo" | "signature"; inverse?: boolean; className?: string; alt: string }) {
  return <img src={kind === "logo" ? logo.url : signature.url} alt={alt} className={cn("object-contain", inverse ? "invert-0 dark:invert" : "invert dark:invert-0", className)} />;
}