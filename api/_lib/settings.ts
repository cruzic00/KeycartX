// api/_lib/settings.ts — port of lib/settings.ts (drops next/cache).
import { createPublicClient } from "./supabase-public";
import { withTtlCache } from "./cache";

export type Media = {
  mediaType: "image" | "video";
  mediaUrl: string;
  title: string;
  subtitle: string;
};

export type SectionBlock = {
  id: string;
  kind: "section";
  title: string;
  subtitle: string;
  source: string; // "trending" or a category slug
};

export type BannerBlock = {
  id: string;
  kind: "banner";
  mediaType: "image" | "video";
  mediaUrl: string;
  title: string;
  subtitle: string;
};

export type Block = SectionBlock | BannerBlock;

export type NavItem = { name: string; href: string };

export type HomeSettings = {
  heroSlides: Media[];
  marquee: string[];
  nav: NavItem[];
  blocks: Block[];
};

export const DEFAULT_HERO: Media = {
  mediaType: "video",
  mediaUrl: "/media/hero.mp4",
  title: "New Drop Is Live",
  subtitle: "Watch the lookbook",
};

export const DEFAULT_MARQUEE = [
  "New Drop Available",
  "Limited Stock",
  "Free Shipping on Orders Over ₹999",
];

export const DEFAULT_NAV: NavItem[] = [
  { name: "HOME", href: "/" },
  { name: "NEW ARRIVALS", href: "/products" },
  { name: "ANIME", href: "/anime" },
  { name: "GYM", href: "/gym" },
  { name: "COLLEGE", href: "/college" },
  { name: "MAFIA", href: "/mafia" },
  { name: "OFFICE", href: "/office" },
];

export type Category = { name: string; subCategories: string[] };

export const DEFAULT_CATEGORIES: Category[] = [
  { name: "Anime", subCategories: ["T-Shirts", "Hoodies"] },
  { name: "Gym", subCategories: ["T-Shirts", "Tanks"] },
  { name: "College", subCategories: ["T-Shirts", "Hoodies"] },
  { name: "Mafia", subCategories: ["T-Shirts"] },
  { name: "Office", subCategories: ["Shirts", "T-Shirts"] },
  { name: "Tshirt", subCategories: ["Oversized", "Regular"] },
];

export const DEFAULT_BLOCKS: Block[] = [
  { id: "trending", kind: "section", title: "Trending Now", subtitle: "Curated top picks for you", source: "trending" },
  { id: "vibe", kind: "banner", mediaType: "video", mediaUrl: "/media/hero.mp4", title: "Wear The Vibe", subtitle: "Premium drops · Limited stock" },
  { id: "tshirts", kind: "section", title: "T-Shirts", subtitle: "Everyday essentials", source: "tshirt" },
];

export const DEFAULT_SETTINGS: HomeSettings = {
  heroSlides: [DEFAULT_HERO],
  marquee: DEFAULT_MARQUEE,
  nav: DEFAULT_NAV,
  blocks: DEFAULT_BLOCKS,
};

// Builds the blocks list, migrating from the older {sections, vibe} shape if needed.
export function normalizeBlocks(d: any): Block[] {
  if (Array.isArray(d?.blocks) && d.blocks.length) return d.blocks;

  if (Array.isArray(d?.sections) && d.sections.length) {
    const sections: Block[] = d.sections.map((s: any) => ({ ...s, kind: "section" }));
    const vibe: Block = d.vibe
      ? { id: "vibe", kind: "banner", ...d.vibe }
      : (DEFAULT_BLOCKS[1] as Block);
    return [sections[0], vibe, ...sections.slice(1)].filter(Boolean);
  }

  return DEFAULT_BLOCKS;
}

export function normalizeSettings(d: any): HomeSettings {
  const heroSlides =
    Array.isArray(d?.heroSlides) && d.heroSlides.length
      ? d.heroSlides
      : d?.hero
        ? [{ ...DEFAULT_HERO, ...d.hero }]
        : [DEFAULT_HERO];

  return {
    heroSlides,
    marquee: Array.isArray(d?.marquee) && d.marquee.length ? d.marquee : DEFAULT_MARQUEE,
    nav: Array.isArray(d?.nav) && d.nav.length ? d.nav : DEFAULT_NAV,
    blocks: normalizeBlocks(d),
  };
}

export const getHomeSettings = withTtlCache(async (): Promise<HomeSettings> => {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("site_settings")
      .select("data")
      .eq("id", 1)
      .single();
    return normalizeSettings(data?.data ?? {});
  } catch {
    return DEFAULT_SETTINGS;
  }
}, 60_000);
