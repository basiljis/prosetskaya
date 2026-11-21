import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";

export function FavoriteButton({ id, lang, className }: { id: string; lang: "ru" | "en"; className?: string }) {
  const { ids, toggle, signedIn } = useFavorites();
  const on = ids.has(id);
  const label = on ? (lang === "ru" ? "Убрать из избранного" : "Remove from favourites") : signedIn ? (lang === "ru" ? "В избранное" : "Add to favourites") : (lang === "ru" ? "Войдите, чтобы сохранить в избранное" : "Sign in to save");
  return <button type="button" onClick={(e) => { e.stopPropagation(); void toggle(id); }} aria-pressed={on} aria-label={label} title={label} className={cn("grid size-9 place-items-center bg-background/90 text-foreground transition-colors hover:text-primary", on && "text-primary", className)}><Heart className={cn("size-4", on && "fill-current")} /></button>;
}
