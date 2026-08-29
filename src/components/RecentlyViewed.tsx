// Port of components/RecentlyViewed.tsx.
import { useEffect, useState } from "react";
import ProductSlider from "./ProductSlider";
import { RECENT_KEY, type ViewedItem } from "./TrackView";

// Shows a "You Watched" rail of recently viewed products (from localStorage).
// Renders nothing if there are none.
export default function RecentlyViewed({
  excludeSlug,
  title = "Recently Viewed",
}: {
  excludeSlug?: string;
  title?: string;
}) {
  const [items, setItems] = useState<ViewedItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      const list: ViewedItem[] = raw ? JSON.parse(raw) : [];
      setItems(excludeSlug ? list.filter((x) => x.slug !== excludeSlug) : list);
    } catch {}
  }, [excludeSlug]);

  if (items.length === 0) return null;

  return (
    <section className="py-12 border-t border-neutral-200/70">
      <h3 className="text-2xl md:text-3xl font-black text-[#1f2937] uppercase tracking-tight mb-8">
        {title}
      </h3>
      <ProductSlider products={items} />
    </section>
  );
}
