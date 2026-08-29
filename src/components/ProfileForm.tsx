import { useState } from "react";
import { User, Phone, Camera, Save, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

type UserData = {
  email: string;
  role: string;
  username?: string;
  phone?: string;
  profilePicture?: string;
  createdAt: string;
};

export default function ProfileForm({ initialUser }: { initialUser: UserData }) {
  const { refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    username: initialUser.username || "",
    phone: initialUser.phone || "",
    profilePicture: initialUser.profilePicture || "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed");
      setMessage({ type: "success", text: "Profile updated successfully!" });
      await refreshUser();
    } catch {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const initials = (formData.username || initialUser.email || "U")[0]?.toUpperCase();
  const memberSince = new Date(initialUser.createdAt);
  const memberSinceLabel = isNaN(memberSince.getTime())
    ? "—"
    : memberSince.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-xl shadow-neutral-200/50 border border-neutral-100 overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* LEFT — summary */}
        <div className="w-full md:w-80 p-8 flex flex-col items-center text-center bg-neutral-50 border-b md:border-b-0 md:border-r border-neutral-100">
          <div className="relative mb-5">
            <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-white shadow-lg bg-gradient-to-br from-[#374151] to-neutral-500 flex items-center justify-center">
              {formData.profilePicture ? (
                <img src={formData.profilePicture} alt="Profile" loading="lazy" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-white">{initials}</span>
              )}
            </div>
            <div className="absolute bottom-1 right-1 bg-accent p-1.5 rounded-full ring-2 ring-white">
              <Camera size={14} className="text-[#1f2937]" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-[#1f2937]">{formData.username || "Anonymous"}</h2>
          <p className="text-neutral-500 text-sm mb-4 break-all">{initialUser.email}</p>

          <span className="px-3 py-1 bg-[#1f2937] text-white rounded-full text-[11px] font-bold uppercase tracking-wider">
            {initialUser.role} Account
          </span>

          <div className="mt-8 w-full border-t border-neutral-200 pt-6">
            <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1">Member Since</p>
            <p className="text-[#374151] text-sm font-medium">{memberSinceLabel}</p>
          </div>
        </div>

        {/* RIGHT — form */}
        <div className="flex-1 p-8 md:p-10">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-[#1f2937]">Profile Settings</h3>
            <p className="text-neutral-500 text-sm mt-1">Update your personal information.</p>
          </div>

          {message && (
            <div className={`mb-6 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              <span className={`h-2 w-2 rounded-full ${message.type === "success" ? "bg-green-500" : "bg-red-500"}`} />
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Username" icon={<User size={18} />}>
                <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="johndoe" className="pf-input" />
              </Field>
              <Field label="Phone" icon={<Phone size={18} />}>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 90000 00000" className="pf-input" />
              </Field>
            </div>

            <div className="pt-4 flex justify-end border-t border-neutral-100">
              <button type="submit" disabled={loading} className="px-8 py-3 bg-[#1f2937] text-white font-bold rounded-xl hover:bg-[#374151] disabled:opacity-50 transition flex items-center gap-2 mt-4">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide ml-1">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">{icon}</span>
        {children}
      </div>
    </div>
  );
}
