import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

type OrderItem = {
  name: string;
  price: number; // paisa
  qty: number;
  size?: string;
  image?: string;
};

type Order = {
  id: string;
  items: OrderItem[];
  total: number; // paisa
  payment: { status?: string };
  status: string;
  shipping?: { tracking?: string };
  created_at: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/orders").then(async (res) => {
      if (res.status === 401) {
        navigate("/login?redirect=/orders");
        return;
      }
      const data = await res.json();
      setOrders(data.orders ?? []);
      setLoading(false);
    });
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">Loading orders...</div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <p className="text-neutral-500">No orders yet.</p>
        <Link to="/" className="underline">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Link to="/profile" className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-[#1f2937] mb-6">
        <ChevronLeft size={16} /> Back to account
      </Link>
      <h1 className="text-2xl font-bold text-[#1f2937] mb-6">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg p-5 shadow-sm bg-white">
            <div className="flex justify-between mb-3 text-sm text-gray-600">
              <span>Ordered on {new Date(order.created_at).toDateString()}</span>
              <span className="font-semibold">₹{(order.total / 100).toFixed(2)}</span>
            </div>

            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <img
                    src={item.image || "/placeholder.png"}
                    alt={item.name}
                    loading="lazy"
                    className="w-12 h-12 rounded object-cover border border-neutral-200 shrink-0"
                  />
                  <span className="flex-1">
                    {item.name}
                    {item.size ? ` (${item.size})` : ""} × {item.qty}
                  </span>
                  <span className="font-medium">₹{(item.price / 100).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {order.shipping?.tracking && (
              <div className="mt-4 p-3 rounded-lg bg-neutral-50 text-sm">
                <span className="text-neutral-500">Tracking: </span>
                <strong className="font-mono">{order.shipping.tracking}</strong>
              </div>
            )}

            <div className="flex justify-between mt-4 text-sm">
              <span>
                Payment: <strong className="capitalize">{order.payment?.status ?? order.status}</strong>
              </span>
              <span>
                Status: <strong className="capitalize">{order.status}</strong>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
