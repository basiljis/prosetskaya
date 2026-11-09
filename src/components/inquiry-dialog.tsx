import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { artist, type Artwork, type Lang } from "@/lib/artworks";
import { boutique, inquiryText } from "@/lib/boutique";

export function InquiryDialog({ work, lang, onClose }: { work: Artwork; lang: Lang; onClose: () => void }) {
  const b = boutique[lang];
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const text = inquiryText(work, lang, name.trim().slice(0, 100), message.trim().slice(0, 1000));
  const encoded = encodeURIComponent(text);
  const channels = [
    { label: "Telegram", href: `${artist.telegram}?text=${encoded}` },
    { label: "WhatsApp", href: `${artist.whatsapp}?text=${encoded}` },
    { label: b.email, href: `mailto:${artist.email}?subject=${encodeURIComponent(`${b.inquiryTitle}: ${work[lang]}`)}&body=${encoded}` },
  ];
  const field = "w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-primary";
  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[95] bg-foreground/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[96] max-h-[92dvh] w-[min(560px,94vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto bg-background p-6 text-foreground shadow-2xl md:p-9">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-[10px] uppercase text-muted-foreground">{b.inquiryTitle}</p><Dialog.Title className="mt-2 font-display text-3xl">{work[lang]}</Dialog.Title></div>
            <Button variant="editorial" size="icon" onClick={onClose} aria-label="×"><X /></Button>
          </div>
          <div className="mt-5 flex gap-4">
            <img src={work.image} alt="" className="h-24 w-24 object-cover" />
            <Dialog.Description className="text-xs leading-6 text-muted-foreground">{b.inquiryText}</Dialog.Description>
          </div>
          <label className="mt-6 block text-[10px] uppercase text-muted-foreground">{b.yourName}<input value={name} maxLength={100} onChange={(e) => setName(e.target.value)} className={field} /></label>
          <label className="mt-5 block text-[10px] uppercase text-muted-foreground">{b.message}<textarea value={message} maxLength={1000} rows={3} placeholder={b.messagePlaceholder} onChange={(e) => setMessage(e.target.value)} className={`${field} resize-none normal-case`} /></label>
          <p className="mt-7 text-[10px] uppercase text-muted-foreground">{b.via}</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {channels.map((c) => <a key={c.label} href={c.href} target={c.href.startsWith("mailto") ? undefined : "_blank"} rel="noreferrer" className="flex items-center justify-center gap-1 border border-foreground py-3 text-xs transition-colors hover:bg-foreground hover:text-background">{c.label}<ArrowUpRight className="size-3" /></a>)}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
