import { Check, Link2, Send } from "lucide-react";
import { useEffect, useState } from "react";

export function ShareBar({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  const wa = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
  const tg = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="me-2 text-sm text-muted">شارك</span>
      <button
        type="button"
        onClick={() => void copyLink()}
        className="inline-flex h-11 items-center gap-2 rounded-full bg-surface px-4 text-sm font-medium text-fg shadow-[var(--shadow-border)] transition-transform duration-150 ease-out active:scale-[0.96]"
      >
        {copied ? <Check className="size-4" strokeWidth={1.5} /> : <Link2 className="size-4" strokeWidth={1.5} />}
        {copied ? "تم النسخ" : "نسخ الرابط"}
      </button>
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-11 items-center rounded-full bg-surface px-4 text-sm font-medium text-fg shadow-[var(--shadow-border)] transition-transform duration-150 ease-out active:scale-[0.96]"
      >
        واتساب
      </a>
      <a
        href={tg}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-11 items-center gap-2 rounded-full bg-surface px-4 text-sm font-medium text-fg shadow-[var(--shadow-border)] transition-transform duration-150 ease-out active:scale-[0.96]"
      >
        <Send className="size-4" strokeWidth={1.5} />
        تيليجرام
      </a>
    </div>
  );
}
