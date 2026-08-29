// Port of app/page.tsx. The original fetched getProducts()/getHomeSettings()
// directly in an async server component; here both come from GET /api/products
// and GET /api/settings via useEffect instead.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Banner from "../components/Banner";
import ProductSlider from "../components/ProductSlider";
import type { SectionBlock, BannerBlock, HomeSettings } from "../../api/_lib/settings";

function productsForSource(all: any[], source: string) {
  if (source === "trending") return all.filter((p) => p.trending);
  return all.filter((p) => (p.category || "").toLowerCase() === source.toLowerCase());
}

function ProductSection({ block, products }: { block: SectionBlock; products: any[] }) {
  return (
    <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
      <div className="max-w-[1600px] mx-auto px-5 lg:px-10 py-14">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-[0.2em] text-primary">
            {block.title}
          </h2>
          <div className="w-24 h-1 bg-accent mx-auto" />
          {block.subtitle && (
            <p className="text-gray-500 font-medium tracking-wide uppercase text-sm">{block.subtitle}</p>
          )}
        </div>
        <ProductSlider products={products} />
      </div>
    </section>
  );
}

function BannerBlockView({ block }: { block: BannerBlock }) {
  return (
    <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen h-[30vh] min-h-[220px] overflow-hidden bg-[#111827]">
      {block.mediaType === "video" ? (
        <video src={block.mediaUrl} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <img src={block.mediaUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">{block.title}</h2>
        {block.subtitle && (
          <p className="mt-3 text-xs md:text-sm text-white/80 tracking-[0.3em] uppercase">{block.subtitle}</p>
        )}
        <Link
          to="/products"
          className="mt-6 px-8 py-3 bg-white text-[#111827] text-sm font-black uppercase tracking-widest hover:bg-neutral-200 transition-colors"
        >
          Shop Now
        </Link>
      </div>
    </section>
  );
}

export default function Home() {
  const [products, setProducts] = useState<any[] | null>(null);
  const [settings, setSettings] = useState<HomeSettings | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ]).then(([p, s]) => {
      setProducts(p);
      setSettings(s);
    });
  }, []);

  if (!products || !settings) return null;

  const heroSlides = settings.heroSlides.map((m) => ({
    type: m.mediaType,
    src: m.mediaUrl,
    title: m.title,
    subtitle: m.subtitle,
  }));

  return (
    <main className="space-y-10">
      <Banner slides={heroSlides} />

      {settings.blocks.map((block) =>
        block.kind === "banner" ? (
          <BannerBlockView key={block.id} block={block} />
        ) : (
          <ProductSection
            key={block.id}
            block={block}
            products={productsForSource(products, block.source)}
          />
        )
      )}
    </main>
  );
}
