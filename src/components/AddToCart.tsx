// Port of app/products/[slug]/parts/AddToCart.tsx.
// - useCart() now comes from ../context/CartContext (already-built cart).
// - useToast() now comes from ../context/ToastContext.
// - useRouter()/router.push -> useNavigate()/navigate.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

type Product = {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  image: string;
  sizes: string[];
};

export default function AddToCart({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [size, setSize] = useState(product.sizes[0]);

  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (loading) return;

    if (!user) {
      // Redirect to login with proper return url
      const returnUrl = window.location.pathname;
      navigate(`/login?redirect=${returnUrl}`);
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      image: product.image,
      size,
    });

    showToast("T-shirt added to cart");
  };

  return (
    <div className="grid gap-4">
      <div className="font-semibold">Choose size</div>

      <div className="flex gap-2">
        {product.sizes.map((s) => (
          <button
            key={s}
            onClick={() => setSize(s)}
            className={`px-4 py-2 rounded-lg border font-bold transition
              ${s === size
                ? "bg-[#111827] text-white"
                : "bg-white text-[#111827] hover:bg-neutral-100"
              }`}
          >
            {s}
          </button>
        ))}
      </div>

      <button
        onClick={handleAddToCart}
        className="bg-[#111827] hover:bg-[#1f2937] text-white px-6 py-3 rounded-md font-bold transition"
      >
        Add to cart
      </button>
    </div>
  );
}
