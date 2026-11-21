import { useEffect, useRef, useState } from "react";

/**
 * Site-wide styled hints: any button/link that has `title` or is icon-only with `aria-label`
 * shows a small tooltip on hover/focus. Native titles are moved to data-hint to avoid double tooltips.
 */
export function HintLayer() {
  const [tip, setTip] = useState<{ text: string; x: number; y: number; below: boolean } | null>(null);
  const timer = useRef<number>(0);
  useEffect(() => {
    const find = (t: EventTarget | null) => {
      const el = (t as Element | null)?.closest?.("button, a, [role=button], [data-hint]") as HTMLElement | null;
      if (!el) return null;
      if (el.title) { el.dataset["hint"] = el.title; el.removeAttribute("title"); }
      const text = el.dataset["hint"] || (!el.textContent?.trim() || el.querySelector(".sr-only") ? el.getAttribute("aria-label") : null);
      return text ? { el, text } : null;
    };
    const show = (e: Event) => {
      const f = find(e.target); window.clearTimeout(timer.current);
      if (!f) { setTip(null); return; }
      timer.current = window.setTimeout(() => {
        const r = f.el.getBoundingClientRect(); const below = r.top < 48;
        setTip({ text: f.text, x: Math.min(Math.max(r.left + r.width / 2, 90), window.innerWidth - 90), y: below ? r.bottom + 8 : r.top - 8, below });
      }, 350);
    };
    const hide = () => { window.clearTimeout(timer.current); setTip(null); };
    document.addEventListener("pointerover", show); document.addEventListener("focusin", show);
    document.addEventListener("pointerdown", hide); document.addEventListener("scroll", hide, true); document.addEventListener("focusout", hide);
    return () => { document.removeEventListener("pointerover", show); document.removeEventListener("focusin", show); document.removeEventListener("pointerdown", hide); document.removeEventListener("scroll", hide, true); document.removeEventListener("focusout", hide); };
  }, []);
  if (!tip) return null;
  return <div role="tooltip" className="pointer-events-none fixed z-[200] max-w-[220px] -translate-x-1/2 rounded-sm bg-foreground px-2.5 py-1.5 text-center text-[11px] leading-4 text-background shadow-md" style={{ left: tip.x, top: tip.y, transform: `translate(-50%, ${tip.below ? "0" : "-100%"})` }}>{tip.text}</div>;
}
