// Port of app/admin/orders/page.tsx. The original was an async server
// component that read getAllOrders() directly; here it comes from
// GET /api/admin/orders via useEffect instead.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader, Card, Badge, Th, EmptyState } from "../../components/admin/AdminUI";
import DeleteOrderButton from "../../components/admin/DeleteOrderButton";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[] | null>(null);

  function fetchOrders() {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []));
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  if (!orders) return <div className="p-10 text-neutral-500">Loading…</div>;

  return (
    <div className="p-8 md:p-10">
      <PageHeader title="Orders" subtitle={`${orders.length} total`} />

      <Card>
        {orders.length === 0 ? (
          <EmptyState text="No orders yet." />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50/80 text-xs uppercase tracking-wider text-neutral-500 border-b border-neutral-100">
              <tr>
                <Th>Order</Th>
                <Th>Customer</Th>
                <Th>Items</Th>
                <Th>Total</Th>
                <Th>Status</Th>
                <Th>Date</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {orders.map((o: any) => {
                const count = (o.items ?? []).reduce(
                  (s: number, i: any) => s + (i.qty || 0),
                  0
                );
                return (
                  <tr key={o.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/admin/orders/${o.id}`} className="flex items-center gap-3 group">
                        <img
                          src={o.items?.[0]?.image || "/placeholder.png"}
                          alt=""
                          loading="lazy"
                          className="w-10 h-10 rounded object-cover border border-neutral-200 shrink-0"
                        />
                        <span className="font-mono text-xs text-neutral-500 group-hover:text-[#111827] underline-offset-2 group-hover:underline">
                          #{String(o.id).slice(0, 8)}
                        </span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-medium text-[#111827]">{o.userEmail}</td>
                    <td className="px-6 py-4 text-neutral-600">{count} item(s)</td>
                    <td className="px-6 py-4 font-bold text-[#111827]">
                      ₹{(o.total / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge value={o.status} />
                    </td>
                    <td className="px-6 py-4 text-neutral-500">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <DeleteOrderButton id={o.id} onDeleted={fetchOrders} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
