// Port of app/checkout/cancel/page.tsx. Static page — no on-mount logic.
import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center">
        <XCircle className="text-red-500 w-20 h-20 mb-6" />
        <h1 className="text-3xl font-black mb-2">Payment Cancelled</h1>
        <p className="text-gray-500 mb-8">
          Your payment didn&apos;t go through. Your cart is still saved — you can try again.
        </p>
        <div className="flex flex-col gap-3 w-full">
          <Link
            to="/cart"
            className="w-full py-3 bg-[#111827] text-white font-bold rounded-lg hover:bg-[#1f2937] transition shadow-lg"
          >
            Back to Cart
          </Link>
          <Link
            to="/"
            className="w-full py-3 bg-gray-100 text-[#111827] font-bold rounded-lg hover:bg-gray-200 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
