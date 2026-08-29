import { Link } from "react-router-dom";

type CardProduct = {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  slug: string;
  price: number; // paisa
  mrp?: number; // paisa
  rating?: number;
  reviews?: number;
  badge?: string;
  imageUrl?: string;
  image?: string;
  category?: string;
};

export default function ProductCard({ product }: { product: CardProduct }) {
  const href = `/products/${product.slug || product._id || product.id}`;
  const img = product.imageUrl || product.image || "/placeholder.png";
  const name = product.title || product.name || "Product";
  const price = product.price / 100;
  const mrp = product.mrp ? product.mrp / 100 : 0;
  const off = mrp > price ? Math.round((1 - price / mrp) * 100) : 0;

  return (
    <Link
      to={href}
      className="card-3d group flex flex-col overflow-hidden bg-white rounded-2xl border border-neutral-100 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
        <img
          src={img}
          alt={name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {product.badge && (
          <span className="absolute top-3 left-3 bg-black/80 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-sm">
            {product.badge}
          </span>
        )}

        {product.rating ? (
          <span className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 text-[#111827] text-xs font-bold px-2 py-1 rounded-full shadow-sm backdrop-blur-sm">
            <span className="text-yellow-500">★</span>
            {product.rating.toFixed(1)}
            {product.reviews ? <span className="text-neutral-400 font-medium">({product.reviews})</span> : null}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-1 p-4">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-lg font-bold text-[#111827]">₹{price.toFixed(0)}</span>
          {off > 0 && (
            <>
              <span className="text-sm text-neutral-400 line-through">₹{mrp.toFixed(0)}</span>
              <span className="text-xs font-bold text-green-600">{off}% OFF</span>
            </>
          )}
        </div>

        <h3 className="text-sm font-medium text-neutral-700 leading-snug line-clamp-2 group-hover:text-accent transition-colors">
          {name}
        </h3>
        <p className="text-[11px] text-gray-400 uppercase tracking-wide">
          {product.category || "T-shirt"}
        </p>
      </div>
    </Link>
  );
}
