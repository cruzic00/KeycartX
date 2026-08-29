// Port of components/ProductGrid.tsx — was a server component fetching
// directly from Supabase; now fetches GET /api/products client-side.
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

type Props = {
  title: string;
  subtitle?: string;
  category?: string;
  emptyText?: string;
};

export default function ProductGrid({
  title,
  subtitle,
  category,
  emptyText = "No products here yet. Check back soon.",
}: Props) {
  const [products, setProducts] = useState<any[] | null>(null);

  useEffect(() => {
    setProducts(null);
    const qs = category ? `?category=${encodeURIComponent(category)}` : "";
    fetch(`/api/products${qs}`)
      .then((r) => r.json())
      .then(setProducts);
  }, [category]);

  return (
    <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
      <div className="max-w-[1600px] mx-auto px-5 lg:px-10 pt-3 pb-10 grid gap-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-[#623903]">
            {title}
          </h2>
          {subtitle && <p className="text-neutral-500 mt-3">{subtitle}</p>}
        </div>

        {!products ? null : products.length === 0 ? (
          <p className="text-neutral-400 text-center py-16">{emptyText}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
            {products.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
