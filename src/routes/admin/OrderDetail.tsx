// Port of app/admin/orders/[id]/page.tsx + OrderManager.tsx. The original
// read the order directly via the Supabase admin client and resolved the
// buyer's email server-side via listUserEmails(); GET /api/admin/orders/:id
// doesn't expose a userEmail field (only user_id), so the customer line
// falls back to showing the user id (or "Guest" for a guest checkout)
// instead of an email address.
//
// PrintButton.tsx was a 15-line component; folded in here as a local
// function rather than a separate file since it has no reuse elsewhere.
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Printer } from "lucide-react";
import { Card } from "../../components/admin/AdminUI";
import OrderManager from "../../components/admin/OrderManager";

function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 text-sm font-bold text-[#623903] hover:bg-neutral-50 transition"
    >
      <Printer size={16} /> Print
    </button>
  );
}

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/orders/${id}`)
      .then(async (r) => {
        if (!r.ok) {
          setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((d) => d && setOrder(d.order));
  }, [id]);

  if (notFound) {
    return (
      <div className="p-8 md:p-10 max-w-4xl">
        <Link to="/admin/orders" className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-[#623903] mb-6">
          <ChevronLeft size={16} /> Back to orders
        </Link>
        <p className="text-neutral-400">Order not found.</p>
      </div>
    );
  }

  if (!order) return <div className="p-10 text-neutral-500">Loading…</div>;

  const customer = order.user_id ? order.user_id : "Guest";

  return (
    <div className="p-8 md:p-10 max-w-4xl">
      <div className="flex items-center justify-between mb-6 no-print">
        <Link to="/admin/orders" className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-[#623903]">
          <ChevronLeft size={16} /> Back to orders
        </Link>
        <PrintButton />
      </div>

      <div id="print-area">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#623903]">Order #{String(order.id).slice(0, 8)}</h1>
          <p className="text-neutral-500 text-sm mt-1">
            {customer} · {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <p className="text-2xl font-black text-[#623903]">₹{(order.total / 100).toFixed(2)}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Items */}
        <Card className="md:col-span-2">
          <div className="p-6 space-y-4">
            <h2 className="font-bold text-[#623903]">Items</h2>
            {(order.items ?? []).map((it: any, i: number) => (
              <div key={i} className="flex items-center gap-4 border-b border-neutral-100 pb-4 last:border-0 last:pb-0">
                <img
                  src={it.image || "/placeholder.png"}
                  alt={it.name}
                  loading="lazy"
                  className="w-16 h-16 rounded-lg object-cover border border-neutral-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#623903] truncate">{it.name}</p>
                  <p className="text-sm text-neutral-500">
                    {it.size ? `Size ${it.size} · ` : ""}Qty {it.qty}
                  </p>
                </div>
                <p className="font-bold text-[#623903]">₹{((it.price * it.qty) / 100).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Manager */}
        <div className="no-print">
          <OrderManager
            id={order.id}
            status={order.status}
            tracking={order.shipping?.tracking ?? ""}
            payment={order.payment}
            onSaved={(status, tracking) =>
              setOrder((prev: any) => ({ ...prev, status, shipping: { ...prev.shipping, tracking } }))
            }
          />
        </div>
      </div>

      {/* Delivery details */}
      <Card className="mt-6">
        <div className="p-6">
          <h2 className="font-bold text-[#623903] mb-4">Delivery Details</h2>
          {order.shipping && (order.shipping.name || order.shipping.address) ? (
            <div className="grid sm:grid-cols-3 gap-x-8 gap-y-3 text-sm">
              {[
                ["Name", order.shipping.name],
                ["Phone", order.shipping.phone],
                ["Address", order.shipping.address],
                ["Landmark", order.shipping.landmark],
                ["District", order.shipping.district],
                ["State", order.shipping.state],
                ["Pincode", order.shipping.pincode],
              ]
                .filter(([, v]) => v)
                .map(([label, value]) => (
                  <div key={label as string}>
                    <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-bold">{label}</p>
                    <p className="text-neutral-800 font-medium">{value}</p>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-neutral-400 text-sm">No delivery details provided.</p>
          )}
        </div>
      </Card>
      </div>
    </div>
  );
}
