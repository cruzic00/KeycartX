// Port of app/admin/_components/Sidebar.tsx. The original layout fetched
// profiles.avatar_url separately server-side; AuthContext's user only
// carries {name, email, role} (from GET /api/auth/session), so the avatar
// falls back to an initial instead of a photo.
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, ShoppingBag, Package, LogOut, CreditCard, Palette } from "lucide-react";

export default function Sidebar({ user }: { user: { username: string; email: string } }) {
  const { pathname } = useLocation();

  const links = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Products", href: "/admin/stocks", icon: Package },
    { name: "Customization", href: "/admin/customization", icon: Palette },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-8 py-7 border-b border-[#1f2937]/80">
        <h1 className="text-2xl font-black tracking-tighter text-white">
          KeyCart<span className="text-neutral-400">X</span>
        </h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500 mt-1">Admin Panel</p>
      </div>

      <div className="flex-1 py-6 px-4 space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              to={link.href}
              className={`flex items-center gap-4 px-6 py-4 rounded-xl text-base font-medium transition-all ${isActive
                  ? "bg-white text-[#111827] shadow-lg shadow-black/20"
                  : "text-neutral-400 hover:text-white hover:bg-[#1f2937]"
                }`}
            >
              <link.icon size={24} />
              {link.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-[#1f2937]">
        <div className="bg-[#1f2937] rounded-xl p-4 flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-neutral-700 overflow-hidden">
            <div className="w-full h-full bg-white flex items-center justify-center font-bold text-[#111827]">
              {user.username[0]}
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-white font-bold text-sm truncate">{user.username}</p>
            <p className="text-neutral-400 text-xs truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          className="flex items-center gap-2 justify-center w-full py-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg text-sm font-semibold transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}
