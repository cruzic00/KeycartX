// Port of app/products/[slug]/parts/ShareButton.tsx. Part of the ProductDetail
// split; no Next.js-specific APIs used here beyond dropping "use client".
import { useState } from "react";
import { Share2 } from "lucide-react";

export default function ShareButton({ title }: { title?: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title: title || "KeyCartX", url });
      } catch {
        /* user cancelled */
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <button
      onClick={share}
      title="Share"
      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50 transition"
    >
      <Share2 size={16} />
      {copied ? "Copied!" : "Share"}
    </button>
  );
}
