// Port of app/products/[slug]/page.tsx (+ its parts/ split, now under
// src/components/). The original was an async server component calling
// getProductBySlug(slug) directly against Supabase; replaced with
// useEffect + fetch(`/api/products?slug=...`) + useState, matching the
// pattern in src/routes/Home.tsx. notFound() -> inline "not found" render.
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AddToCart from "../components/AddToCart";
import ProductGallery from "../components/ProductGallery";
import ProductSlider from "../components/ProductSlider";
import ReviewForm from "../components/ReviewForm";
import ShareButton from "../components/ShareButton";
import TrackView from "../components/TrackView";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<any | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    fetch(`/api/products?slug=${encodeURIComponent(slug)}`)
      .then(async (r) => {
        if (r.status === 404) {
          setNotFound(true);
          setProduct(null);
          return;
        }
        const data = await r.json();
        setProduct(data);
      })
      .catch(() => {
        setNotFound(true);
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return null;

  if (notFound || !product) {
    return (
      <div className="max-w-3xl mx-auto py-24 text-center">
        <h1 className="text-2xl font-bold text-[#623903] mb-2">Product not found</h1>
        <p className="text-neutral-500">The product you&apos;re looking for doesn&apos;t exist or was removed.</p>
      </div>
    );
  }

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
      <TrackView
        item={{
          id: String(product.id ?? product._id ?? product.slug),
          slug: product.slug,
          name: product.name,
          price: product.price,
          mrp: product.mrp,
          image: product.image,
          rating: product.rating,
          reviews: product.reviews,
          badge: product.badge,
          category: product.category,
        }}
      />
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
        <section className="grid gap-10 md:grid-cols-2 py-12">
          {/* IMAGE GALLERY */}
          <div>
            <ProductGallery
              images={product.images && product.images.length > 0 ? product.images : [product.image]}
              productName={product.name}
            />
          </div>

          {/* DETAILS */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-3xl font-extrabold text-[#623903]">{product.name}</h1>
                <ShareButton title={product.name} />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-400">
                  {"★".repeat(Math.round(product.rating || 4.5))}{"☆".repeat(5 - Math.round(product.rating || 4.5))}
                </div>
                <span className="text-sm text-neutral-500">{product.reviewsCount || 128} reviews</span>
              </div>

              <div className="flex items-baseline flex-wrap gap-3 mb-4">
                <span className="text-3xl font-bold text-[#623903]">
                  ₹{(product.price / 100).toFixed(0)}
                </span>
                {product.mrp && product.mrp > product.price && (
                  <>
                    <span className="text-lg text-neutral-400 line-through">
                      ₹{(product.mrp / 100).toFixed(0)}
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      {Math.round((1 - product.price / product.mrp) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-neutral-500 -mt-2 mb-4">Inclusive of all taxes</p>

              <p className="font-medium text-neutral-600 mb-6">{product.description}</p>
            </div>

            <AddToCart product={product} />

            {/* BADGES */}
            <div className="flex flex-wrap gap-4 py-4 border-y border-neutral-100">
              {product.freeDelivery && (
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                  <span className="p-2 bg-neutral-100 rounded-full">🚚</span> Free Delivery
                </div>
              )}
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                <span className="p-2 bg-neutral-100 rounded-full">🔄</span> 7 Days Returns &amp; Exchange
              </div>
            </div>

            {/* PRODUCT DETAILS */}
            {(() => {
              const rows = [
                ["Product Category", product.category],
                ["Product Type", product.productType],
                ["Fabric", product.fabric],
                ["Fit", product.fit],
                ["Closure", product.closure],
              ].filter(([, v]) => v);
              return rows.length > 0 ? (
                <div>
                  <h3 className="font-bold text-[#623903] mb-2">Product Details</h3>
                  <div className="bg-neutral-50 rounded-lg p-4 text-sm">
                    {rows.map(([label, value]) => (
                      <div key={label as string} className="flex justify-between py-1.5 border-b border-neutral-200 last:border-0">
                        <span className="text-neutral-500">{label}</span>
                        <span className="font-medium text-[#623903] capitalize">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        </section>

        <section className="pb-12">
          {/* REVIEWS SECTION */}
          <div className="pt-16 border-t border-neutral-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-12">
              <div>
                <h2 className="text-4xl font-black text-[#623903] mb-4 tracking-tight">Customer Reviews</h2>
                <div className="flex items-center gap-4">
                  <span className="text-6xl font-black text-[#623903] tracking-tighter">{(product.rating || 4.5).toFixed(1)}</span>
                  <div className="flex flex-col gap-1">
                    <div className="flex text-yellow-400 text-xl tracking-wide">
                      {"★".repeat(Math.round(product.rating || 4.5))}{"☆".repeat(5 - Math.round(product.rating || 4.5))}
                    </div>
                    <span className="text-neutral-500 font-medium">{product.reviewsCount || 1245} verified reviews</span>
                  </div>
                </div>
              </div>

              <ReviewForm productId={product.id} onSubmitted={load} />
            </div>

            {/* Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {product.customersSay && product.customersSay.length > 0 ? (
                product.customersSay.map((review: any, i: number) => (
                  <div key={i} className="bg-neutral-50 p-6 rounded-3xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-neutral-100 group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        {review.image ? (
                          <img src={review.image} alt="User" className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-sm font-bold text-[#623903] shadow-sm border border-neutral-100">
                            {review.reviewer?.[0] || 'A'}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-[#623903]">{review.reviewer || "Anonymous"}</p>
                          <div className="text-xs text-neutral-400">Verified Buyer</div>
                        </div>
                      </div>
                      <div className="flex text-yellow-400 text-xs gap-0.5">
                        {"★".repeat(review.rating || 5)}{"☆".repeat(5 - (review.rating || 5))}
                      </div>
                    </div>

                    <p className="text-neutral-600 leading-relaxed mb-6 font-medium">
                      "{review.text}"
                    </p>

                    <div className="flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-200/50 pt-4">
                      <span>{new Date(review.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <button className="hover:text-[#623903] transition-colors opacity-0 group-hover:opacity-100">Helpful?</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
                  <div className="text-4xl mb-4 opacity-20">💬</div>
                  <h3 className="text-lg font-bold text-[#623903] mb-2">No reviews yet</h3>
                  <p className="text-neutral-500 max-w-md mx-auto">Be the first to share your thoughts on this product. Your feedback helps others make better choices.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* RELATED PRODUCTS (Recommendations) */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <section className="py-12 border-t border-neutral-100">
            <div className="mb-10">
              <h3 className="text-2xl md:text-3xl font-black text-[#623903] uppercase tracking-tight">You Might Also Like</h3>
            </div>

            <ProductSlider products={product.relatedProducts} />
          </section>
        )}
      </div>
    </div>
  );
}
