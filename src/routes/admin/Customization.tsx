// Port of app/admin/customization/page.tsx. This page already fetched data
// client-side in the original (it was a "use client" component), so the
// only change is dropping the "use client" directive.
import { useEffect, useState } from "react";
import { Save, Upload, Plus, Trash2, Loader2, GripVertical, Image as ImageIcon, LayoutGrid } from "lucide-react";

type Media = { mediaType: "image" | "video"; mediaUrl: string; title: string; subtitle: string };
type SectionBlock = { id: string; kind: "section"; title: string; subtitle: string; source: string };
type BannerBlock = { id: string; kind: "banner"; mediaType: "image" | "video"; mediaUrl: string; title: string; subtitle: string };
type Block = SectionBlock | BannerBlock;
type NavItem = { name: string; href: string };
type Settings = { heroSlides: Media[]; marquee: string[]; nav: NavItem[]; blocks: Block[] };

const SOURCES = [
  { value: "trending", label: "Trending (⭐ marked products)" },
  { value: "tshirt", label: "T-Shirts" },
  { value: "anime", label: "Anime" },
  { value: "gym", label: "Gym" },
  { value: "college", label: "College" },
  { value: "mafia", label: "Mafia" },
  { value: "office", label: "Office" },
];

async function uploadFile(file: File): Promise<{ url: string; type: "image" | "video" } | null> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) {
    alert(data.error || "Upload failed");
    return null;
  }
  return data;
}

export default function CustomizationPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const [cats, setCats] = useState<{ name: string }[]>([]);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then(setSettings);
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCats(d.categories || []))
      .catch(() => { });
  }, []);

  const linkTargets = [
    { label: "— Hidden (don't show) —", href: "" },
    { label: "Home", href: "/" },
    { label: "All Products", href: "/products" },
    { label: "Cart", href: "/cart" },
    ...cats.slice(0, 6).map((c, idx) => ({
      label: `Option ${idx + 1} (${c.name})`,
      href: `/c/${c.name.toLowerCase()}`,
    })),
  ];

  function patchHeroSlide(i: number, patch: Partial<Media>) {
    setSettings((s) => {
      if (!s) return s;
      const heroSlides = [...s.heroSlides];
      heroSlides[i] = { ...heroSlides[i], ...patch };
      return { ...s, heroSlides };
    });
  }

  function addHeroSlide() {
    setSettings((s) =>
      s ? { ...s, heroSlides: [...s.heroSlides, { mediaType: "image", mediaUrl: "", title: "", subtitle: "" }] } : s
    );
  }

  function removeHeroSlide(i: number) {
    setSettings((s) => (s ? { ...s, heroSlides: s.heroSlides.filter((_, idx) => idx !== i) } : s));
  }

  function updateMarquee(i: number, val: string) {
    setSettings((s) => {
      if (!s) return s;
      const marquee = [...s.marquee];
      marquee[i] = val;
      return { ...s, marquee };
    });
  }

  function addMarquee() {
    setSettings((s) => (s ? { ...s, marquee: [...s.marquee, "New text"] } : s));
  }

  function removeMarquee(i: number) {
    setSettings((s) => (s ? { ...s, marquee: s.marquee.filter((_, idx) => idx !== i) } : s));
  }

  function updateNav(i: number, patch: Partial<NavItem>) {
    setSettings((s) => {
      if (!s) return s;
      const nav = [...s.nav];
      nav[i] = { ...nav[i], ...patch };
      return { ...s, nav };
    });
  }

  function addNav() {
    setSettings((s) => (s ? { ...s, nav: [...s.nav, { name: "NEW LINK", href: "/" }] } : s));
  }

  function removeNav(i: number) {
    setSettings((s) => (s ? { ...s, nav: s.nav.filter((_, idx) => idx !== i) } : s));
  }

  function patchBlock(i: number, patch: Partial<Block>) {
    setSettings((s) => {
      if (!s) return s;
      const blocks = [...s.blocks];
      blocks[i] = { ...blocks[i], ...patch } as Block;
      return { ...s, blocks };
    });
  }

  function addSection() {
    setSettings((s) =>
      s ? { ...s, blocks: [...s.blocks, { id: `s${Date.now()}`, kind: "section", title: "New Section", subtitle: "", source: "tshirt" }] } : s
    );
  }

  function addBanner() {
    setSettings((s) =>
      s ? { ...s, blocks: [...s.blocks, { id: `b${Date.now()}`, kind: "banner", mediaType: "image", mediaUrl: "", title: "New Banner", subtitle: "" }] } : s
    );
  }

  function removeBlock(i: number) {
    setSettings((s) => (s ? { ...s, blocks: s.blocks.filter((_, idx) => idx !== i) } : s));
  }

  function onDrop(dropIndex: number) {
    setSettings((s) => {
      if (!s || dragIndex === null || dragIndex === dropIndex) return s;
      const blocks = [...s.blocks];
      const [moved] = blocks.splice(dragIndex, 1);
      blocks.splice(dropIndex, 0, moved);
      return { ...s, blocks };
    });
    setDragIndex(null);
  }

  async function save() {
    if (!settings) return;
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setMsg(res.ok ? "Saved! Refresh the home page to see changes." : "Failed to save.");
  }

  if (!settings) return <div className="p-10 text-neutral-500">Loading…</div>;

  return (
    <div className="p-8 md:p-10 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#623903] tracking-tight">Customization</h1>
          <p className="text-neutral-500 mt-1 text-sm">Drag to reorder · add as many banners and sections as you like.</p>
        </div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-[#623903] text-white font-bold rounded-xl hover:bg-[#7a4a05] transition disabled:opacity-50">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save
        </button>
      </div>

      {msg && <div className="mb-6 p-3 rounded-lg bg-neutral-100 text-neutral-700 text-sm font-medium">{msg}</div>}

      {/* MARQUEE */}
      <div className="bg-white rounded-2xl border border-neutral-200/70 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#623903]">Top Marquee Strip</h2>
          <button onClick={addMarquee} className="flex items-center gap-1 text-sm font-bold text-[#623903] px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50">
            <Plus size={15} /> Add Text
          </button>
        </div>
        <div className="space-y-2">
          {settings.marquee.map((text, i) => (
            <div key={i} className="flex gap-2">
              <input value={text} onChange={(e) => updateMarquee(i, e.target.value)} className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-[#623903] outline-none" />
              <button onClick={() => removeMarquee(i)} className="text-red-500 hover:bg-red-50 px-3 rounded-lg"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="bg-white rounded-2xl border border-neutral-200/70 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#623903]">Navigation Menu</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Type a name, then pick which page it opens.</p>
          </div>
          <button onClick={addNav} className="flex items-center gap-1 text-sm font-bold text-[#623903] px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50">
            <Plus size={15} /> Add Link
          </button>
        </div>
        <div className="space-y-2">
          {settings.nav.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input value={item.name} onChange={(e) => updateNav(i, { name: e.target.value })} placeholder="Menu name (e.g. ANIME)" className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-[#623903] outline-none" />
              <select value={item.href} onChange={(e) => updateNav(i, { href: e.target.value })} className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-[#623903] outline-none bg-white">
                {!linkTargets.some((t) => t.href === item.href) && item.href && (
                  <option value={item.href}>{item.href}</option>
                )}
                {linkTargets.map((t) => (
                  <option key={t.href} value={t.href}>{t.label}</option>
                ))}
              </select>
              <button onClick={() => removeNav(i)} className="text-red-500 hover:bg-red-50 px-3 rounded-lg"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* HERO SLIDES */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-[#623903]">Main Hero Banner</h2>
        <button onClick={addHeroSlide} className="flex items-center gap-1 text-sm font-bold text-[#623903] px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50">
          <ImageIcon size={15} /> Add Slide
        </button>
      </div>
      <div className="space-y-4 mb-8">
        {settings.heroSlides.map((slide, i) => (
          <div key={i} className="bg-white rounded-2xl border border-neutral-200/70 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Slide {i + 1}</span>
              {settings.heroSlides.length > 1 && (
                <button onClick={() => removeHeroSlide(i)} className="text-red-500 hover:bg-red-50 p-1.5 rounded">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <MediaFields media={slide} onChange={(p) => patchHeroSlide(i, p)} />
          </div>
        ))}
      </div>

      {/* BLOCKS */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-[#623903]">Home Blocks</h2>
        <div className="flex gap-2">
          <button onClick={addSection} className="flex items-center gap-1 text-sm font-bold text-[#623903] px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50">
            <LayoutGrid size={15} /> Add Section
          </button>
          <button onClick={addBanner} className="flex items-center gap-1 text-sm font-bold text-[#623903] px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50">
            <ImageIcon size={15} /> Add Banner
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {settings.blocks.map((block, i) => (
          <div
            key={block.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(i)}
            className={`bg-white rounded-2xl border shadow-sm p-5 transition ${dragIndex === i ? "border-[#623903] opacity-60" : "border-neutral-200/70"}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span
                  draggable
                  onDragStart={() => setDragIndex(i)}
                  onDragEnd={() => setDragIndex(null)}
                  className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-700"
                  title="Drag to reorder"
                >
                  <GripVertical size={20} />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  {block.kind === "banner" ? "🖼 Banner" : "▦ Section"}
                </span>
              </div>
              <button onClick={() => removeBlock(i)} className="text-red-500 hover:bg-red-50 p-1.5 rounded">
                <Trash2 size={16} />
              </button>
            </div>

            {block.kind === "section" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={block.title} onChange={(e) => patchBlock(i, { title: e.target.value })} placeholder="Title (e.g. Trending Now)" className="px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-[#623903] outline-none" />
                <select value={(block as SectionBlock).source} onChange={(e) => patchBlock(i, { source: e.target.value } as any)} className="px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-[#623903] outline-none">
                  {SOURCES.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <input value={block.subtitle} onChange={(e) => patchBlock(i, { subtitle: e.target.value })} placeholder="Subtitle" className="px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-[#623903] outline-none md:col-span-2" />
              </div>
            ) : (
              <MediaFields media={block as BannerBlock} onChange={(p) => patchBlock(i, p)} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MediaFields({ media, onChange }: { media: Media; onChange: (p: Partial<Media>) => void }) {
  const [busy, setBusy] = useState(false);
  async function handleUpload(file: File) {
    setBusy(true);
    const r = await uploadFile(file);
    setBusy(false);
    if (r) onChange({ mediaUrl: r.url, mediaType: r.type });
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <input value={media.title} onChange={(e) => onChange({ title: e.target.value })} placeholder="Title" className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-[#623903] outline-none" />
        <input value={media.subtitle} onChange={(e) => onChange({ subtitle: e.target.value })} placeholder="Subtitle" className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-[#623903] outline-none" />
        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium transition">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Upload image / video
          <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
        </label>
        <input value={media.mediaUrl} onChange={(e) => onChange({ mediaUrl: e.target.value, mediaType: /\.(mp4|webm|ogg)$/i.test(e.target.value) ? "video" : "image" })} placeholder="…or paste a media URL" className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:ring-2 focus:ring-[#623903] outline-none" />
      </div>
      <div className="aspect-video rounded-lg overflow-hidden bg-neutral-100 flex items-center justify-center">
        {media.mediaUrl ? (
          media.mediaType === "video" ? (
            <video src={media.mediaUrl} muted loop autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <img src={media.mediaUrl} alt="preview" className="w-full h-full object-cover" />
          )
        ) : (
          <span className="text-neutral-400 text-sm">No media</span>
        )}
      </div>
    </div>
  );
}
