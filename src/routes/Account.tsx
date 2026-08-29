import { useEffect, useState } from "react";

type Order = {
  id: string;
  items: unknown[];
  total: number; // paisa
  status: string;
  created_at: string;
};

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => (res.ok ? res.json() : { orders: [] }))
      .then((data) => setOrders(data.orders ?? []))
      .catch(() => setOrders([]));
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">My Orders</h1>
      <div className="mt-3 space-y-3">
        {!orders || orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="p-3 border rounded">
              <div>Order: {o.id}</div>
              <div>Items: {Array.isArray(o.items) ? o.items.length : 0}</div>
              <div>Total: ₹{(o.total / 100).toFixed(2)}</div>
              <div className="capitalize">Status: {o.status}</div>
              <div>Date: {new Date(o.created_at).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
