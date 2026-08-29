// Port of app/products/[slug]/parts/ShareButton.tsx.
//
// The original called navigator.share and fell back to the clipboard, with
// both failures swallowed by empty catch blocks - so on a desktop browser
// that has neither, clicking Share did nothing at all and said nothing about
// it. Now the native share sheet is used only where it actually exists
// (phones); everywhere else the button opens a small menu with the share
// targets the store already links in its footer, plus a copy-link fallback
// that reports whether it worked.
import { useEffect, useRef, useState } from "react";
import { Share2, Link2, Check } from "lucide-react";
import { FaWhatsapp, FaTwitter, FaFacebookF, FaTelegramPlane } from "react-icons/fa";

type Status = "idle" | "copied" | "failed";

export default function ShareButton({ title }: { title?: string }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const rootRef = useRef<HTMLDivElement>(null);

  const url = typeof window !== "undefined" ? window.location.href : "";
  const text = title || "KeyCartX";

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (status === "idle") return;
    const t = setTimeout(() => setStatus("idle"), 1800);
    return () => clearTimeout(t);
  }, [status]);

  async function copyLink() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // clipboard API needs a secure context; this keeps plain http working.
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (!ok) throw new Error("copy rejected");
      }
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    setOpen(false);
  }

  async function onClick() {
    // Phones get the real share sheet. Desktop Chrome exposes navigator.share
    // on some platforms but often cannot service it, so require the touch
    // hint too rather than opening something that silently fails.
    const canNativeShare =
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function" &&
      window.matchMedia("(pointer: coarse)").matches;

    if (canNativeShare) {
      try {
        await navigator.share({ title: text, url });
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") return; // user dismissed the sheet
        // Anything else: fall through to the menu.
      }
    }
    setOpen((v) => !v);
  }

  const targets = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      icon: <FaWhatsapp className="text-[#25D366]" size={16} />,
    },
    {
      label: "Twitter",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      icon: <FaTwitter className="text-[#1DA1F2]" size={16} />,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: <FaFacebookF className="text-[#1877F2]" size={16} />,
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      icon: <FaTelegramPlane className="text-[#229ED9]" size={16} />,
    },
  ];

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={onClick}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50 transition"
      >
        {status === "copied" ? <Check size={16} className="text-green-600" /> : <Share2 size={16} />}
        {status === "copied" ? "Copied!" : status === "failed" ? "Copy failed" : "Share"}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-neutral-200 bg-white shadow-xl overflow-hidden z-50"
        >
          {targets.map((t) => (
            <a
              key={t.label}
              role="menuitem"
              href={t.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition"
            >
              {t.icon}
              {t.label}
            </a>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={copyLink}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition border-t border-neutral-100"
          >
            <Link2 size={16} className="text-neutral-500" />
            Copy link
          </button>
        </div>
      )}
    </div>
  );
}
