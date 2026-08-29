// Port of components/TrackView.tsx. localStorage-only logic, no framework
// changes needed beyond dropping "use client".
import { useEffect } from "react";

export type ViewedItem = {
  id: string;
  slug: string;
  name: string;
  price: number; // paisa
  mrp?: number;
  image?: string;
  rating?: number;
  reviews?: number;
  badge?: string;
  category?: string;
};

export const RECENT_KEY = "keycartx:recentlyViewed";
const MAX = 12;

// Records the current product into localStorage (most-recent first, de-duped).
export default function TrackView({ item }: { item: ViewedItem }) {
  useEffect(() => {
    if (!item?.slug) return;
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      const list: ViewedItem[] = raw ? JSON.parse(raw) : [];
      const next = [item, ...list.filter((x) => x.slug !== item.slug)].slice(0, MAX);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {}
  }, [item]);

  return null;
}
