// Port of app/admin/stocks/CategoryManager.tsx. "use client" dropped, no
// other Next.js-specific APIs were used so this ports verbatim.
import { useEffect, useState } from "react";
import { Plus, Trash2, Save, Loader2, X } from "lucide-react";

type Category = { name: string; subCategories: string[] };

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [newCat, setNewCat] = useState("");
  const [subInputs, setSubInputs] = useState<Record<number, string>>({});

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  function addCategory() {
    const name = newCat.trim();
    if (!name || !categories) return;
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      alert("Category already exists");
      return;
    }
    setCategories([...categories, { name, subCategories: [] }]);
    setNewCat("");
  }

  function removeCategory(i: number) {
    if (!categories) return;
    setCategories(categories.filter((_, idx) => idx !== i));
  }

  function addSub(i: number) {
    const val = (subInputs[i] || "").trim();
    if (!val || !categories) return;
    const next = [...categories];
    if (!next[i].subCategories.includes(val)) next[i].subCategories.push(val);
    setCategories(next);
    setSubInputs({ ...subInputs, [i]: "" });
  }

  function removeSub(i: number, sub: string) {
    if (!categories) return;
    const next = [...categories];
    next[i].subCategories = next[i].subCategories.filter((s) => s !== sub);
    setCategories(next);
  }

  async function save() {
    if (!categories) return;
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/admin/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories }),
    });
    setSaving(false);
    setMsg(res.ok ? "Saved!" : "Failed to save");
  }

  if (!categories) return <div className="p-6 text-gray-500">Loading…</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Categories</h2>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#623903] text-white font-bold rounded-xl hover:bg-[#7a4a05] transition disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
        </button>
      </div>

      {msg && <div className="mb-4 p-2.5 rounded-lg bg-neutral-100 text-neutral-700 text-sm font-medium">{msg}</div>}

      {/* Add category */}
      <div className="flex gap-2 mb-6">
        <input
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCategory()}
          placeholder="New category name (e.g. Hoodies)"
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#623903] outline-none"
        />
        <button onClick={addCategory} className="flex items-center gap-1 px-4 py-2.5 bg-[#623903] text-white font-bold rounded-xl hover:bg-[#7a4a05]">
          <Plus size={16} /> Add
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {categories.length === 0 && <p className="text-gray-400 text-sm">No categories yet.</p>}
        {categories.map((cat, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50/60">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 capitalize">{cat.name}</h3>
              <button onClick={() => removeCategory(i)} className="text-red-500 hover:bg-red-50 p-1.5 rounded">
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {cat.subCategories.map((sub) => (
                <span key={sub} className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full px-3 py-1 text-sm">
                  {sub}
                  <button onClick={() => removeSub(i, sub)} className="text-gray-400 hover:text-red-500">
                    <X size={13} />
                  </button>
                </span>
              ))}
              {cat.subCategories.length === 0 && <span className="text-xs text-gray-400">No sub-categories</span>}
            </div>

            <div className="flex gap-2">
              <input
                value={subInputs[i] || ""}
                onChange={(e) => setSubInputs({ ...subInputs, [i]: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && addSub(i)}
                placeholder="Add sub-category"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#623903] outline-none"
              />
              <button onClick={() => addSub(i)} className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium">
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
