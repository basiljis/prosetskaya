import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function ExpandableText({ text, lang, className = "" }: { text: string; lang: "ru" | "en"; className?: string }) {
  const [open, setOpen] = useState(false);
  const [first, ...rest] = text.split(/\n\s*\n/);
  return <div className={className}>
    <p className="whitespace-pre-line">{open ? text : first}</p>
    {rest.length > 0 && <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="mt-2 inline-flex items-center gap-1 text-xs text-foreground underline-offset-4 hover:underline">
      {open ? (lang === "ru" ? "Свернуть" : "Show less") : (lang === "ru" ? "Читать полностью" : "Read more")}<ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
    </button>}
  </div>;
}
