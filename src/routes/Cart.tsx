// Port of app/cart/page.tsx.
import { Link } from "react-router-dom";
import { ShoppingBag, Minus, Plus, Trash2, ChevronLeft } from "lucide-react";
import { useCart } from "../context/CartContext";
import CheckoutButton from "../components/CheckoutButton";
import RecentlyViewed from "../components/RecentlyViewed";

export default function CartPage() {
  const { items, total, removeItem, updateQty, clear } = useCart();
  const hasItems = items.length > 0;
  const saved = items.reduce(
    (s, it) => s + (it.mrp && it.mrp > it.price ? (it.mrp - it.price) * it.qty : 0),
    0
  );

  return (
    <div className="max-w-6xl mx-auto py-8">
      <Link to="/profile" className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-[#1f2937] mb-6">
        <ChevronLeft size={16} /> Back to account
      </Link>
      <h1 className="text-3xl font-bold text-[#1f2937] mb-8">Your Cart</h1>

      {!hasItems && (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-white rounded-3xl border border-neutral-200/70 shadow-sm">
          <div className="p-5 rounded-full bg-neutral-100 text-[#374151] mb-5">
            <ShoppingBag size={32} />
          </div>
          <p className="text-lg font-bold text-[#1f2937]">Your cart is empty</p>
          <p className="text-neutral-500 text-sm mt-1 mb-6">Looks like you haven&apos;t added anything yet.</p>
          <Link
            to="/products"
            className="px-6 py-3 bg-[#1f2937] text-white font-bold rounded-xl hover:bg-[#374151] transition"
          >
            Start Shopping
          </Link>
        </div>
      )}

      {hasItems && (
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((it) => (
              <div
                key={`${it.id}-${it.size}`}
                className="flex gap-4 bg-white rounded-2xl border border-neutral-200/70 shadow-sm p-4"
              >
                <img
                  src={it.image}
                  alt={it.name}
                  className="w-24 h-24 rounded-xl object-cover border border-neutral-200 shrink-0"
                />

                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-[#1f2937] truncate">{it.name}</h3>
                      <p className="text-sm text-neutral-500 mt-0.5">Size: {it.size}</p>
                    </div>
                    <button
                      onClick={() => removeItem(it.id, it.size)}
                      className="text-neutral-400 hover:text-red-500 transition p-1 -mr-1 shrink-0"
                      aria-label="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-3">
                    {/* Qty stepper */}
                    <div className="inline-flex items-center border border-neutral-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQty(it.id, it.size, it.qty - 1)}
                        disabled={it.qty <= 1}
                        className="px-2.5 py-1.5 text-[#1f2937] hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={15} />
                      </button>
                      <span className="px-3 min-w-[2.5rem] text-center font-semibold text-[#1f2937]">{it.qty}</span>
                      <button
                        onClick={() => updateQty(it.id, it.size, it.qty + 1)}
                        className="px-2.5 py-1.5 text-[#1f2937] hover:bg-neutral-100 transition"
                        aria-label="Increase quantity"
                      >
                        <Plus size={15} />
                      </button>
                    </div>

                    <p className="font-bold text-[#1f2937]">₹{((it.price * it.qty) / 100).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={clear}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-red-500 transition"
            >
              <Trash2 size={15} /> Clear cart
            </button>
          </div>

          {/* Summary */}
          <aside className="bg-white rounded-2xl border border-neutral-200/70 shadow-sm p-6 space-y-4 lg:sticky lg:top-28">
            <h2 className="font-bold text-[#1f2937] text-lg">Order Summary</h2>

            <div className="flex justify-between text-sm text-neutral-600">
              <span>Subtotal</span>
              <span className="font-semibold text-[#1f2937]">₹{(total / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-neutral-600">
              <span>Shipping</span>
              <span className="font-semibold text-green-600">Free</span>
            </div>
            {saved > 0 && (
              <div className="flex justify-between text-sm text-neutral-600">
                <span>You Saved</span>
                <span className="font-semibold text-green-600">−₹{(saved / 100).toFixed(2)}</span>
              </div>
            )}

            <div className="border-t border-neutral-200 pt-4 flex justify-between items-baseline">
              <span className="font-bold text-[#1f2937]">Total</span>
              <span className="text-2xl font-black text-[#1f2937]">₹{(total / 100).toFixed(2)}</span>
            </div>

            <CheckoutButton className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1f2937] text-white font-bold rounded-xl hover:bg-[#374151] transition" />

            <p className="text-center text-xs text-neutral-400"></p>
          </aside>
        </div>
      )}

      <RecentlyViewed title="Recently Viewed" />
    </div>
  );
}
