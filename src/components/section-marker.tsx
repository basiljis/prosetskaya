import type { ReactNode } from "react";

export function SectionMarker({ number, children, inverse = false, fullWidth = false }: { number: string; children: ReactNode; inverse?: boolean; fullWidth?: boolean }) {
  return <div data-section-marker className={`sticky top-[76px] z-30 mb-8 h-11 border-b text-xs ${inverse ? "border-background/20 bg-foreground text-background" : "border-border bg-background text-foreground"}`}><div className={`flex h-full items-center ${fullWidth ? "gallery-shell" : ""}`}><span className={`mr-2 ${inverse ? "text-background/60" : "text-muted-foreground"}`}>{number} —</span>{children}</div></div>;
}