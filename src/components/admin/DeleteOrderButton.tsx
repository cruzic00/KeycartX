// Port of app/admin/orders/DeleteOrderButton.tsx. The original called
// router.refresh() to re-run the server component's data fetch; since the
// Orders list now fetches client-side, this takes an onDeleted callback
// instead so the parent can re-fetch its list.
import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";

export default function DeleteOrderButton({ id, onDeleted }: { id: string; onDeleted?: () => void }) {
  const [loading, setLoading] = useState(false);

  async function del() {
    if (!confirm("Delete this order? This cannot be undone.")) return;
    setLoading(true);
    const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) onDeleted?.();
    else alert("Failed to delete order");
  }

  return (
    <button
      onClick={del}
      disabled={loading}
      className="text-neutral-400 hover:text-red-500 transition p-1.5 rounded hover:bg-red-50 disabled:opacity-50"
      aria-label="Delete order"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
    </button>
  );
}
