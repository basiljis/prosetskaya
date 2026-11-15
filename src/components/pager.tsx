import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pager({ page, pages, onChange, label }: { page: number; pages: number; onChange: (page: number) => void; label: string }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  return <nav aria-label={label} className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
    <Button variant="editorial" size="icon" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="←"><ArrowLeft /></Button>
    {nums.map((n, i) => <span key={n} className="flex items-center gap-1.5">{i > 0 && n - nums[i - 1]! > 1 && <span className="px-1 text-xs text-muted-foreground">…</span>}<Button variant="editorial" onClick={() => onChange(n)} aria-current={n === page ? "page" : undefined} className={`h-9 min-w-9 rounded-full border px-3 text-xs ${n === page ? "border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "border-border"}`}>{n}</Button></span>)}
    <Button variant="editorial" size="icon" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="→"><ArrowRight /></Button>
  </nav>;
}
