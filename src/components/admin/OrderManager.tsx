// Port of app/admin/orders/[id]/OrderManager.tsx. router.refresh() replaced
// with an onSaved callback so OrderDetail can update its local order state.
import { useState } from "react";
import { Save, Loader2 } from "lucide-react";

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

export default function OrderManager({
  id,
  status: initialStatus,
  tracking: initialTracking,
  payment,
  onSaved,
}: {
  id: string;
  status: string;
  tracking: string;
  payment?: { provider?: string; status?: string };
  onSaved?: (status: string, tracking: string) => void;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [tracking, setTracking] = useState(initialTracking);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMsg(null);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, tracking }),
    });
    setSaving(false);
    setMsg(res.ok ? "Saved!" : "Failed to save");
    if (res.ok) onSaved?.(status, tracking);
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/70 shadow-sm p-6 space-y-5 h-fit">
      <h2 className="font-bold text-[#623903]">Manage</h2>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wide text-neutral-500 mb-1.5">Order Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-200 rounded-lg capitalize focus:ring-2 focus:ring-[#623903] outline-none"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wide text-neutral-500 mb-1.5">Tracking Code</label>
        <input
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="e.g. EK123456789IN"
          className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-[#623903] outline-none"
        />
        <p className="text-xs text-neutral-400 mt-1">Shown to the customer on their orders page.</p>
      </div>

      {payment?.provider && (
        <div className="text-xs text-neutral-500">
          Payment: <span className="capitalize font-semibold">{payment.provider}</span> · {payment.status}
        </div>
      )}

      <button
        onClick={save}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#623903] text-white font-bold rounded-xl hover:bg-[#7a4a05] transition disabled:opacity-50"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Save changes
      </button>

      {msg && <p className="text-sm text-center text-neutral-600">{msg}</p>}
    </div>
  );
}
