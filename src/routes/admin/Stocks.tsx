// Port of app/admin/stocks/page.tsx. This page already fetched data
// client-side in the original (it was a "use client" component), so the
// only changes are dropping "use client" and importing CategoryManager
// from its new location under src/components/admin.
import { useState, useEffect, useRef } from "react";
import { useScrollLock } from "../../lib/scrollLock";
import { Plus, Search, Edit, Trash2, X, Save, RefreshCw, Loader2 } from "lucide-react";
import CategoryManager from "../../components/admin/CategoryManager";

type Cat = { name: string; subCategories: string[] };

type Product = {
    _id?: string;
    name: string;
    brand: string;
    category: string;
    subCategory: string;
    productType?: string;
    fabric?: string;
    fit?: string;
    closure?: string;
    unit: string;
    sizes?: string[]; // variants; empty = product has no size/variant
    mrp: number; // Maximum Retail Price
    supplierPrice: number;
    cgst: number; // %
    sgst: number; // %
    commission: number; // % or fixed
    appPrice: number; // Calculated
    status: "Active" | "Not Active" | "Offer Active";
    imageUrl?: string;
    images?: string[]; // gallery
    image?: string; // fallback
    aboutItems?: string[];
    reviewsCount?: number;
    rating?: number;
    customersSay?: { text: string; reviewer: string; image: string }[];
    replacementPolicy?: string;
    freeDelivery?: boolean;
    trending?: boolean;
    technicalDetails?: { label: string; value: string }[];
    recommendation?: string[];
};

const EMPTY_PRODUCT: Product = {
    name: "",
    brand: "KeyCartX",
    category: "",
    subCategory: "",
    productType: "",
    fabric: "",
    fit: "",
    closure: "",
    unit: "1pc",
    sizes: [],
    mrp: 0,
    supplierPrice: 0,
    cgst: 0,
    sgst: 0,
    commission: 0,
    appPrice: 0,
    status: "Active",
    aboutItems: [],
    reviewsCount: 0,
    rating: 0,
    customersSay: [],
    replacementPolicy: "3 days replacement",
    freeDelivery: true,
    trending: false,
    technicalDetails: [],
    recommendation: [],
    images: [],
};

export default function StocksPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [view, setView] = useState<"products" | "categories">("products");
    const [cats, setCats] = useState<Cat[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Product>(EMPTY_PRODUCT);
    const [galleryUploading, setGalleryUploading] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const selectAllRef = useRef<HTMLInputElement>(null);

    // Freeze the page behind the modal (and pause Lenis smooth scrolling).
    useScrollLock(isModalOpen);

    async function uploadToStorage(file: File): Promise<string | null> {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) {
            alert(data.error || "Upload failed");
            return null;
        }
        return data.url;
    }

    async function addGalleryImage(file: File) {
        setGalleryUploading(true);
        const url = await uploadToStorage(file);
        setGalleryUploading(false);
        if (url) setFormData(prev => ({ ...prev, images: [...(prev.images || []), url] }));
    }

    function removeGalleryImage(index: number) {
        setFormData(prev => ({ ...prev, images: (prev.images || []).filter((_, i) => i !== index) }));
    }

    useEffect(() => {
        fetchProducts();
        fetch("/api/admin/categories")
            .then((r) => r.json())
            .then((d) => setCats(d.categories || []))
            .catch(() => { });
    }, []);

    const subOptions = cats.find((c) => c.name.toLowerCase() === (formData.category || "").toLowerCase())?.subCategories || [];

    async function fetchProducts() {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/stocks");
            if (res.ok) {
                const data = await res.json();
                // Convert Paise back to Rupees for display (divide by 100)
                const mappedDate = data.map((p: any) => ({
                    ...p,
                    mrp: p.mrp ? p.mrp / 100 : 0,
                    supplierPrice: p.supplierPrice ? p.supplierPrice / 100 : 0,
                    appPrice: p.price ? p.price / 100 : (p.appPrice ? p.appPrice / 100 : 0),
                    price: p.price ? p.price / 100 : 0
                }));
                setProducts(mappedDate);
            }
        } catch (err) {
            console.error("Failed to fetch products", err);
        } finally {
            setLoading(false);
        }
    }

    // App Price = the sale price entered (no taxes/commission).
    function calculateAppPrice(p: Product) {
        return Math.round(Number(p.supplierPrice) || 0);
    }

    useEffect(() => {
        // Keep App Price in sync with the entered sale price.
        const calculated = calculateAppPrice(formData);
        setFormData(prev => ({ ...prev, appPrice: calculated }));
    }, [formData.supplierPrice]);

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (name === "freeDelivery" || name === "trending") {
            setFormData(prev => ({ ...prev, [name]: checked }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: name === "name" || name === "brand" || name === "category" || name === "subCategory" || name === "productType" || name === "fabric" || name === "fit" || name === "closure" || name === "unit" || name === "status" || name === "imageUrl" || name === "replacementPolicy"
                ? value
                : Number(value)
        }));
    }

    function handleArrayChange(index: number, value: string, field: "aboutItems") {
        const newArray = [...(formData[field] || [])];
        newArray[index] = value;
        setFormData(prev => ({ ...prev, [field]: newArray }));
    }

    function addArrayItem(field: "aboutItems") {
        setFormData(prev => ({ ...prev, [field]: [...(prev[field] || []), ""] }));
    }

    function removeArrayItem(index: number, field: "aboutItems") {
        const newArray = [...(formData[field] || [])];
        newArray.splice(index, 1);
        setFormData(prev => ({ ...prev, [field]: newArray }));
    }

    function handleTechnicalDetailChange(index: number, key: "label" | "value", val: string) {
        const newDetails = [...(formData.technicalDetails || [])];
        newDetails[index] = { ...newDetails[index], [key]: val };
        setFormData(prev => ({ ...prev, technicalDetails: newDetails }));
    }

    function addTechnicalDetail() {
        setFormData(prev => ({ ...prev, technicalDetails: [...(prev.technicalDetails || []), { label: "", value: "" }] }));
    }

    function removeTechnicalDetail(index: number) {
        const newDetails = [...(formData.technicalDetails || [])];
        newDetails.splice(index, 1);
        setFormData(prev => ({ ...prev, technicalDetails: newDetails }));
    }

    function handleReviewChange(index: number, key: "text" | "reviewer" | "image", val: string) {
        const newReviews = [...(formData.customersSay || [])];
        newReviews[index] = { ...newReviews[index], [key]: val };
        setFormData(prev => ({ ...prev, customersSay: newReviews }));
    }

    function addReview() {
        setFormData(prev => ({ ...prev, customersSay: [...(prev.customersSay || []), { text: "", reviewer: "", image: "" }] }));
    }

    function removeReview(index: number) {
        const newReviews = [...(formData.customersSay || [])];
        newReviews.splice(index, 1);
        setFormData(prev => ({ ...prev, customersSay: newReviews }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const method = editingId ? "PUT" : "POST";

            // Convert prices to Paise (x100) for storage
            const payload = {
                ...formData,
                mrp: Math.round(Number(formData.mrp) * 100),
                supplierPrice: Math.round(Number(formData.supplierPrice) * 100),
                appPrice: Math.round(Number(formData.appPrice) * 100), // appPrice is already calcd, ensuring it's in paise
                price: Math.round(Number(formData.appPrice) * 100), // 'price' is the field used by ProductCard
                _id: editingId ? editingId : undefined
            };

            console.log("Submitting payload:", payload);

            const res = await fetch("/api/admin/stocks", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setIsModalOpen(false);
                setEditingId(null);
                setFormData(EMPTY_PRODUCT);
                fetchProducts();
            } else {
                const errorData = await res.json();
                alert(`Failed to save product: ${errorData.error || "Unknown server error"}`);
            }
        } catch (err: any) {
            console.error(err);
            alert(`Error saving product: ${err.message || String(err)}`);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this item?")) return;
        try {
            const res = await fetch(`/api/admin/stocks?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchProducts();
            } else {
                const errorData = await res.json();
                alert(`Failed to delete product: ${errorData.error || "Unknown server error"}`);
            }
        } catch (err: any) {
            console.error("Delete Error:", err);
            alert(`Error deleting product: ${err.message || String(err)}`);
        }
    }

    function openEdit(p: Product) {
        setFormData(p);
        setEditingId(p._id!);
        setIsModalOpen(true);
    }

    const categories = Array.from(
        new Set(products.map(p => (p.category || "").trim()).filter(Boolean))
    ).sort();

    const filteredProducts = products.filter(p => {
        const q = searchTerm.toLowerCase();
        const matchesSearch =
            (p.name || "").toLowerCase().includes(q) ||
            (p.brand || "").toLowerCase().includes(q);
        const matchesCategory =
            !categoryFilter || (p.category || "").toLowerCase() === categoryFilter.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    // ---- Bulk selection -----------------------------------------------
    // "Select all" covers the rows currently visible, not the whole catalogue.
    const visibleIds = filteredProducts.map(p => p._id).filter(Boolean) as string[];
    const selectedVisible = visibleIds.filter(id => selected.has(id)).length;
    const allVisibleSelected = visibleIds.length > 0 && selectedVisible === visibleIds.length;

    // Drop the selection whenever the filters change, so a bulk delete can
    // never hit a row the user can no longer see.
    useEffect(() => {
        setSelected(new Set());
    }, [searchTerm, categoryFilter]);

    // `indeterminate` is a DOM property, not an attribute - it has to be set on the node.
    useEffect(() => {
        if (selectAllRef.current) {
            selectAllRef.current.indeterminate = selectedVisible > 0 && !allVisibleSelected;
        }
    }, [selectedVisible, allVisibleSelected]);

    function toggleAll() {
        setSelected(allVisibleSelected ? new Set() : new Set(visibleIds));
    }

    function toggleOne(id: string) {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    async function handleBulkDelete() {
        const ids = [...selected];
        if (!ids.length) return;
        if (!confirm(`Delete ${ids.length} selected product${ids.length > 1 ? "s" : ""}? This cannot be undone.`)) return;

        setBulkDeleting(true);
        const results = await Promise.allSettled(
            ids.map(async id => {
                const res = await fetch(`/api/admin/stocks?id=${id}`, { method: "DELETE" });
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data?.error || "Unknown server error");
                }
            })
        );
        const failed = results.filter(r => r.status === "rejected").length;
        setBulkDeleting(false);
        setSelected(new Set());
        await fetchProducts();
        if (failed) alert(`${failed} of ${ids.length} item(s) could not be deleted.`);
    }

    return (
        <div className="p-2 md:p-4 min-h-screen bg-gray-50 text-gray-900 font-sans w-full">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900">Stock List</h1>
                    <p className="text-gray-500 text-base mt-2">Manage your inventory, prices, and taxes</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={fetchProducts} className="p-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition text-gray-600">
                        <RefreshCw size={24} />
                    </button>
                    <button
                        onClick={() => { setFormData(EMPTY_PRODUCT); setEditingId(null); setIsModalOpen(true); }}
                        className="flex items-center gap-3 px-6 py-3 bg-[#111827] text-white rounded-xl hover:bg-[#1f2937] transition shadow-lg shadow-[#111827]/20 font-bold text-base"
                    >
                        <Plus size={24} />
                        Add Item
                    </button>
                </div>
            </div>

            {/* VIEW TOGGLE */}
            <div className="inline-flex bg-white border border-gray-200 rounded-xl p-1 mb-6">
                <button onClick={() => setView("products")} className={`px-5 py-2 rounded-lg text-sm font-bold transition ${view === "products" ? "bg-[#111827] text-white" : "text-gray-600 hover:text-gray-900"}`}>Products</button>
                <button onClick={() => setView("categories")} className={`px-5 py-2 rounded-lg text-sm font-bold transition ${view === "categories" ? "bg-[#111827] text-white" : "text-gray-600 hover:text-gray-900"}`}>Categories</button>
            </div>

            {view === "categories" && <CategoryManager />}

            {view === "products" && (
              <>
            {/* FILTERS */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-wrap gap-6 items-center">
                <div className="relative flex-1 min-w-[320px]">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-12 pr-6 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#111827] text-base"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="border border-gray-200 rounded-xl px-6 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#111827] capitalize"
                >
                    <option value="">All Categories</option>
                    {categories.map(c => (
                        <option key={c} value={c} className="capitalize">{c}</option>
                    ))}
                </select>
            </div>

            {/* BULK ACTION BAR - only present while something is selected */}
            {selected.size > 0 && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-5 py-3 shadow-sm">
                    <span className="text-sm font-semibold text-gray-700">
                        {selected.size} item{selected.size > 1 ? "s" : ""} selected
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSelected(new Set())}
                            className="px-4 py-2 text-sm font-semibold text-gray-600 rounded-lg hover:bg-gray-100 transition"
                        >
                            Clear
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            disabled={bulkDeleting}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                        >
                            <Trash2 size={16} />
                            {bulkDeleting ? "Deleting..." : `Delete selected`}
                        </button>
                    </div>
                </div>
            )}

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4 w-12">
                                    <input
                                        ref={selectAllRef}
                                        type="checkbox"
                                        checked={allVisibleSelected}
                                        onChange={toggleAll}
                                        disabled={visibleIds.length === 0}
                                        aria-label="Select all products"
                                        className="w-4 h-4 rounded border-gray-300 text-neutral-800 focus:ring-neutral-700 cursor-pointer disabled:cursor-not-allowed"
                                    />
                                </th>
                                <th className="px-6 py-4">#</th>
                                <th className="px-6 py-4">Product Name</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4 hidden sm:table-cell">MRP</th>
                                <th className="px-6 py-4 bg-neutral-100 text-[#1f2937]">App Price</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={8} className="text-center py-10 text-gray-500">Loading...</td></tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-10 text-gray-500">No products found</td></tr>
                            ) : (
                                filteredProducts.map((p, i) => (
                                    <tr
                                        key={p._id || i}
                                        className={`transition ${p._id && selected.has(p._id) ? "bg-neutral-50" : "hover:bg-gray-50"}`}
                                    >
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={!!p._id && selected.has(p._id)}
                                                onChange={() => p._id && toggleOne(p._id)}
                                                aria-label={`Select ${p.name}`}
                                                className="w-4 h-4 rounded border-gray-300 text-neutral-800 focus:ring-neutral-700 cursor-pointer"
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-500">{i + 1}</td>
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            {p.imageUrl && <img src={p.imageUrl} alt="" loading="lazy" className="w-10 h-10 rounded object-cover border border-gray-200" />}
                                            <span className="font-semibold text-gray-800 line-clamp-1 w-48" title={p.name}>{p.name}</span>
                                        </td>
                                        <td className="px-6 py-4 capitalize">{p.category || "-"}</td>
                                        <td className="px-6 py-4 text-gray-500 hidden sm:table-cell">₹{p.mrp}</td>
                                        <td className="px-6 py-4 font-bold text-[#111827] bg-neutral-100 border-x border-neutral-200">₹{calculateAppPrice(p)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'Active' ? 'bg-green-100 text-green-700' :
                                                p.status === 'Offer Active' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => openEdit(p)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium text-xs"
                                                >
                                                    <Edit size={14} />
                                                    Edit
                                                </button>
                                                <button onClick={() => handleDelete(p._id!)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-gray-100 text-xs text-gray-500 flex justify-between items-center">
                    <span>Showing {filteredProducts.length} items</span>
                    {selected.size > 0 && <span>{selected.size} selected</span>}
                </div>
            </div>
              </>
            )}

            {/* MODAL */}
            {/* The overlay is the scroll container (not the panel) and uses
                overscroll-contain, so scrolling the modal never chains through
                to the admin page behind it. */}
            {isModalOpen && (
                <div data-lenis-prevent className="fixed inset-0 bg-black/50 z-50 overflow-y-auto overscroll-contain p-4 backdrop-blur-sm">
                  <div className="flex min-h-full items-center justify-center">
                    <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10 backdrop-blur">
                            <h2 className="text-xl font-bold text-gray-900">{editingId ? "Edit Item" : "Add New Item"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            {/* SECTION 1: BASIC INFO */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Basic Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                        <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#111827] outline-none" placeholder="e.g. Black Pepper 100g" />
                                    </div>
                                    {/* Brand is hardcoded to KeyCartX, hidden from user */}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#111827] outline-none capitalize">
                                            <option value="">Select Category</option>
                                            {cats.map((c) => (
                                                <option key={c.name} value={c.name} className="capitalize">{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category</label>
                                        <select name="subCategory" value={formData.subCategory} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#111827] outline-none" disabled={!formData.category}>
                                            <option value="">{formData.category ? "Select Sub Category" : "Pick a category first"}</option>
                                            {subOptions.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                        <input name="unit" value={formData.unit} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#111827] outline-none" placeholder="e.g. 100g" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Sizes / Variants</label>
                                        <input
                                            value={(formData.sizes || []).join(", ")}
                                            onChange={(e) =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    sizes: e.target.value.split(",").map(v => v.trim()).filter(Boolean),
                                                }))
                                            }
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#111827] outline-none"
                                            placeholder="e.g. S, M, L, XL  -  or leave empty"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Comma separated. Leave empty for products with no size (accessories, mugs, gadgets) -
                                            the size picker is then hidden on the product page.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                                        <div className="flex items-center gap-4">
                                            {formData.imageUrl && <img src={formData.imageUrl} alt="Preview" loading="lazy" className="w-12 h-12 rounded object-cover border" />}
                                            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
                                                {galleryUploading ? <Loader2 size={14} className="animate-spin" /> : null}
                                                Choose File
                                                <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    setGalleryUploading(true);
                                                    const url = await uploadToStorage(file);
                                                    setGalleryUploading(false);
                                                    if (url) setFormData(prev => ({ ...prev, imageUrl: url }));
                                                }} />
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#111827] outline-none">
                                            <option value="Active">Active</option>
                                            <option value="Not Active">Not Active</option>
                                            <option value="Offer Active">Offer Active</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* GALLERY IMAGES */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Gallery Images</h3>
                                <div className="flex flex-wrap gap-3 items-center">
                                    {(formData.images || []).map((img, index) => (
                                        <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                                            <img src={img} alt="" loading="lazy" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeGalleryImage(index)} className="absolute top-0.5 right-0.5 bg-white/90 rounded-full p-1 text-red-500 opacity-0 group-hover:opacity-100 transition">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="cursor-pointer w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-[#111827] hover:text-[#111827] transition">
                                        {galleryUploading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} />}
                                        <span className="text-[10px] mt-1">Add</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && addGalleryImage(e.target.files[0])} />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Shown on the product page alongside the main image.</p>
                            </div>

                            {/* SPECIFICATIONS */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Specifications</h3>
                                <p className="text-xs text-gray-400 mb-4">
                                    Shown as &quot;Product Details&quot; on the product page (Category comes from above).
                                    Name each spec yourself, so this works for any product - clothing, electronics,
                                    accessories, anything.
                                </p>

                                {/* Free-form label/value rows rather than fixed clothing fields,
                                    so a phone holder can list "Material / Compatibility" just as
                                    easily as a shirt lists "Fabric / Fit". */}
                                <div className="space-y-2">
                                    {(formData.technicalDetails || []).map((detail, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                value={detail.label}
                                                onChange={(e) => handleTechnicalDetailChange(index, "label", e.target.value)}
                                                className="w-1/3 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#111827] outline-none"
                                                placeholder="Spec name (e.g. Material)"
                                            />
                                            <input
                                                value={detail.value}
                                                onChange={(e) => handleTechnicalDetailChange(index, "value", e.target.value)}
                                                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#111827] outline-none"
                                                placeholder="Value (e.g. ABS Plastic)"
                                            />
                                            <button type="button" onClick={() => removeTechnicalDetail(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {(formData.technicalDetails || []).length === 0 && (
                                        <p className="text-sm text-gray-400 italic">No specifications added yet.</p>
                                    )}
                                    <button type="button" onClick={addTechnicalDetail} className="text-sm text-[#111827] font-bold hover:underline flex items-center gap-1 pt-1">
                                        <Plus size={16} /> Add Specification
                                    </button>
                                </div>

                                {/* Legacy clothing fields: only surfaced for products that already
                                    have them, so old data stays editable without cluttering the
                                    form for everything else. */}
                                {(formData.productType || formData.fabric || formData.fit || formData.closure) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-4 border-t border-gray-100">
                                        <p className="col-span-full text-xs text-gray-400">
                                            Older clothing fields on this product. Clear them and add them as
                                            specifications above if you prefer.
                                        </p>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                                            <input name="productType" value={formData.productType || ""} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#111827] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Fabric</label>
                                            <input name="fabric" value={formData.fabric || ""} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#111827] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Fit</label>
                                            <input name="fit" value={formData.fit || ""} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#111827] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Closure</label>
                                            <input name="closure" value={formData.closure || ""} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#111827] outline-none" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* SECTION 1.5: ADDITIONAL DETAILS */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Additional Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Customers Say</label>
                                        {formData.customersSay && formData.customersSay.length > 0 ? (
                                            formData.customersSay.map((review, index) => (
                                                <div key={index} className="mb-4 p-4 border border-gray-100 rounded-lg bg-gray-50">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="text-xs font-bold text-gray-500 uppercase">Review #{index + 1}</h4>
                                                        <button type="button" onClick={() => removeReview(index)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <textarea
                                                            placeholder="Review Text"
                                                            value={review.text}
                                                            onChange={(e) => handleReviewChange(index, "text", e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#111827] outline-none text-sm"
                                                            rows={2}
                                                        />
                                                        <div className="flex gap-3">
                                                            <input
                                                                placeholder="Reviewer Name"
                                                                value={review.reviewer}
                                                                onChange={(e) => handleReviewChange(index, "reviewer", e.target.value)}
                                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#111827] outline-none text-sm"
                                                            />
                                                            <div className="flex items-center gap-2">
                                                                {review.image && <img src={review.image} alt="Review" loading="lazy" className="w-8 h-8 rounded object-cover border" />}
                                                                <label className="cursor-pointer bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 px-3 py-2 rounded-lg text-xs font-medium transition">
                                                                    Upload Img
                                                                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (!file) return;
                                                                        const url = await uploadToStorage(file);
                                                                        if (url) handleReviewChange(index, "image", url);
                                                                    }} />
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-gray-400 italic mb-2">No reviews added yet.</p>
                                        )}
                                        <button type="button" onClick={addReview} className="text-sm text-[#111827] font-bold hover:underline flex items-center gap-1">
                                            <Plus size={16} /> Add Review
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Related Products (IDs)</label>
                                        {formData.recommendation && formData.recommendation.length > 0 && formData.recommendation.map((recId, index) => (
                                            <div key={index} className="flex gap-2 mb-2">
                                                <input
                                                    value={recId}
                                                    onChange={(e) => {
                                                        const newRecs = [...(formData.recommendation || [])];
                                                        newRecs[index] = e.target.value;
                                                        setFormData(prev => ({ ...prev, recommendation: newRecs }));
                                                    }}
                                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#111827] outline-none"
                                                    placeholder="Product ID"
                                                />
                                                <button type="button" onClick={() => {
                                                    const newRecs = [...(formData.recommendation || [])];
                                                    newRecs.splice(index, 1);
                                                    setFormData(prev => ({ ...prev, recommendation: newRecs }));
                                                }} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={18} /></button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, recommendation: [...(prev.recommendation || []), ""] }))} className="text-sm text-[#111827] font-bold hover:underline flex items-center gap-1">
                                            <Plus size={16} /> Add Related Product ID
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Replacement Policy</label>
                                        <input name="replacementPolicy" value={formData.replacementPolicy} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#111827] outline-none" />
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" name="freeDelivery" checked={formData.freeDelivery} onChange={handleInputChange} className="w-5 h-5 text-[#111827] rounded focus:ring-[#111827]" />
                                            <span className="text-sm font-medium text-gray-700">Free Delivery</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" name="trending" checked={!!formData.trending} onChange={handleInputChange} className="w-5 h-5 text-neutral-700 rounded focus:ring-neutral-700" />
                                            <span className="text-sm font-medium text-gray-700">⭐ Show in Trending</span>
                                        </label>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">About This Item (Bullet Points)</label>
                                        {formData.aboutItems?.map((item, index) => (
                                            <div key={index} className="flex gap-2 mb-2">
                                                <input value={item} onChange={(e) => handleArrayChange(index, e.target.value, "aboutItems")} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#111827] outline-none" placeholder="Feature point..." />
                                                <button type="button" onClick={() => removeArrayItem(index, "aboutItems")} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => addArrayItem("aboutItems")} className="text-sm text-[#111827] font-bold hover:underline flex items-center gap-1">
                                            <Plus size={16} /> Add Point
                                        </button>
                                    </div>

                                    {/* Technical Details moved up into the Specifications section -
                                        it is the same label/value data, edited in one place. */}
                                </div>
                            </div>

                            {/* SECTION 2: PRICING */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Pricing</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">MRP</label>
                                        <input type="number" name="mrp" value={formData.mrp} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#111827] outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#111827] mb-1">Sale Price (₹)</label>
                                        <input type="number" name="supplierPrice" value={formData.supplierPrice} onChange={handleInputChange} className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:ring-2 focus:ring-[#111827] outline-none font-bold" />
                                    </div>
                                    <div className="bg-neutral-100 p-4 rounded-xl border border-neutral-200 flex flex-col justify-center">
                                        <label className="block text-xs font-bold text-[#1f2937] mb-1">Final Price</label>
                                        <div className="text-3xl font-black text-[#111827]">₹{formData.appPrice}</div>
                                        <p className="text-xs text-neutral-500 mt-1 opacity-80">Shown to customers</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-white text-gray-700 font-bold rounded-lg border border-gray-200 hover:bg-gray-50 transition">Cancel</button>
                                <button type="submit" className="px-8 py-2 bg-[#111827] text-white font-bold rounded-lg hover:bg-[#1f2937] transition shadow-lg shadow-[#111827]/20 flex items-center gap-2">
                                    <Save size={18} />
                                    Save Item
                                </button>
                            </div>
                        </form>
                    </div>
                  </div>
                </div>
            )}
        </div>
    );
}
