// Port of app/checkout/success/page.tsx. Static confirmation page — no
// on-mount logic, no query-param order id in the original.
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center">
        <CheckCircle className="text-green-500 w-20 h-20 mb-6" />
        <h1 className="text-3xl font-black mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 mb-8">
          Thank you for your purchase. We&apos;ve received your order and it will be
          processed shortly.
        </p>
        <div className="flex flex-col gap-3 w-full">
          <Link
            to="/orders"
            className="w-full py-3 bg-[#1f2937] text-white font-bold rounded-lg hover:bg-[#374151] transition shadow-lg"
          >
            View My Orders
          </Link>
          <Link
            to="/"
            className="w-full py-3 bg-gray-100 text-[#1f2937] font-bold rounded-lg hover:bg-gray-200 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
