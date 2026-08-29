import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, MapPin, Trash2, Pencil, Plus, Save, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

type Address = {
  name: string;
  phone: string;
  address: string;
  landmark: string;
  district: string;
  state: string;
  pincode: string;
};

const EMPTY: Address = {
  name: "",
  phone: "",
  address: "",
  landmark: "",
  district: "",
  state: "",
  pincode: "",
};

export default function AddressesPage() {
  const { user } = useAuth();
  const [list, setList] = useState<Address[]>([]);
  // editing index, "new" for add, or null
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<Address>(EMPTY);

  const key = () => `keycartx:addresses:${user?.email || "guest"}`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key());
      setList(raw ? JSON.parse(raw) : []);
    } catch {
      setList([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function save(next: Address[]) {
    setList(next);
    try {
      localStorage.setItem(key(), JSON.stringify(next));
    } catch {}
  }

  function remove(i: number) {
    if (!confirm("Remove this address?")) return;
    save(list.filter((_, idx) => idx !== i));
  }

  function startEdit(i: number) {
    setForm(list[i]);
    setEditing(i);
  }

  function startAdd() {
    setForm({ ...EMPTY, name: user?.name || "" });
    setEditing("new");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (editing === "new") {
      save([...list, form]);
    } else if (typeof editing === "number") {
      save(list.map((a, idx) => (idx === editing ? form : a)));
    }
    setEditing(null);
  }

  function update(k: keyof Address, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const formCard = (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-[#111827]/30 ring-1 ring-[#111827]/20 shadow-sm p-5 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Full Name" className="addr-in" />
        <input required value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Phone Number" className="addr-in" />
      </div>
      <textarea required value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Address (house, street, area)" rows={2} className="addr-in w-full" />
      <input value={form.landmark} onChange={(e) => update("landmark", e.target.value)} placeholder="Landmark (optional)" className="addr-in w-full" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input required value={form.district} onChange={(e) => update("district", e.target.value)} placeholder="District" className="addr-in" />
        <input required value={form.state} onChange={(e) => update("state", e.target.value)} placeholder="State" className="addr-in" />
        <input required value={form.pincode} onChange={(e) => update("pincode", e.target.value)} placeholder="Pincode" className="addr-in" />
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={() => setEditing(null)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-neutral-200 text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition">
          <X size={15} /> Cancel
        </button>
        <button type="submit" className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#111827] text-white text-sm font-bold hover:bg-[#1f2937] transition">
          <Save size={15} /> Save
        </button>
      </div>
    </form>
  );

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Link to="/profile" className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-[#111827] mb-6">
        <ChevronLeft size={16} /> Back to account
      </Link>
      <h1 className="text-3xl font-bold text-[#111827] mb-2">My Addresses</h1>
      <p className="text-neutral-500 mb-8">Your saved delivery addresses.</p>

      {list.length === 0 && editing !== "new" ? (
        <div className="flex flex-col items-center justify-center text-center py-16 bg-white rounded-3xl border border-neutral-200/70 shadow-sm">
          <div className="p-5 rounded-full bg-neutral-100 text-[#1f2937] mb-5">
            <MapPin size={28} />
          </div>
          <p className="text-lg font-bold text-[#111827]">No saved addresses</p>
          <p className="text-neutral-500 text-sm mt-1 mb-6">
            Add an address or save one at checkout.
          </p>
          <button onClick={startAdd} className="inline-flex items-center gap-2 px-6 py-3 bg-[#111827] text-white font-bold rounded-xl hover:bg-[#1f2937] transition">
            <Plus size={16} /> Add Address
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((a, i) =>
            editing === i ? (
              <div key={i}>{formCard}</div>
            ) : (
              <div
                key={i}
                className="flex items-start gap-3 bg-white rounded-2xl border border-neutral-200/70 shadow-sm p-5"
              >
                <MapPin size={18} className="text-[#1f2937] mt-0.5 shrink-0" />
                <div className="text-sm flex-1 min-w-0">
                  <p className="font-bold text-[#111827]">
                    {a.name} · {a.phone}
                  </p>
                  <p className="text-neutral-600 mt-0.5">
                    {a.address}
                    {a.landmark ? `, ${a.landmark}` : ""}
                  </p>
                  <p className="text-neutral-600">
                    {a.district}, {a.state} - {a.pincode}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(i)}
                    className="text-neutral-400 hover:text-[#111827] transition p-1.5 rounded hover:bg-neutral-100"
                    aria-label="Edit address"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => remove(i)}
                    className="text-neutral-400 hover:text-red-500 transition p-1.5 rounded hover:bg-red-50"
                    aria-label="Remove address"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          )}

          {editing === "new" && formCard}

          {editing === null && (
            <button
              onClick={startAdd}
              className="w-full flex items-center justify-center gap-2 border border-dashed border-neutral-300 text-[#111827] py-3 rounded-xl font-bold hover:bg-neutral-50 transition"
            >
              <Plus size={16} /> Add New Address
            </button>
          )}
        </div>
      )}
    </div>
  );
}
