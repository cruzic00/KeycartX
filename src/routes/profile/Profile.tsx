import { Link } from "react-router-dom";
import { Package, ShoppingBag, UserCog, LayoutDashboard, ChevronRight, MapPin, HelpCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AccountPage() {
  const { user } = useAuth();

  const name = user?.name || user?.email?.split("@")[0] || "there";
  const isAdmin = user?.role === "admin";

  const cards = [
    { href: "/orders", icon: Package, title: "Your Orders", desc: "Track, return, or buy things again" },
    { href: "/profile/edit", icon: UserCog, title: "Login & Profile", desc: "Edit your name & phone" },
    { href: "/cart", icon: ShoppingBag, title: "Your Cart", desc: "Items ready for checkout" },
    { href: "/profile/addresses", icon: MapPin, title: "Addresses", desc: "Manage your delivery details" },
    { href: "mailto:mynonlineshop@gmail.com", icon: HelpCircle, title: "Support", desc: "Get help with your orders" },
    ...(isAdmin ? [{ href: "/admin", icon: LayoutDashboard, title: "Admin Panel", desc: "Manage products & orders" }] : []),
  ];

  return (
    <div className="max-w-5xl mx-auto py-10 px-2">
      <h1 className="text-3xl font-bold text-[#1f2937]">Hello, {name}</h1>
      <p className="text-neutral-500 mt-1 mb-8">Manage your account, orders and settings.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((c, i) =>
          c.href.startsWith("mailto:") ? (
            <a
              key={i}
              href={c.href}
              className="group flex items-start gap-4 bg-white border border-neutral-200/70 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <div className="p-3 rounded-xl bg-neutral-100 text-[#374151] group-hover:bg-[#1f2937] group-hover:text-white transition-colors shrink-0">
                <c.icon size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#1f2937] flex items-center gap-1">
                  {c.title}
                  <ChevronRight size={16} className="text-neutral-400 transition-transform group-hover:translate-x-1" />
                </h3>
                <p className="text-sm text-neutral-500 mt-0.5">{c.desc}</p>
              </div>
            </a>
          ) : (
            <Link
              key={i}
              to={c.href}
              className="group flex items-start gap-4 bg-white border border-neutral-200/70 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <div className="p-3 rounded-xl bg-neutral-100 text-[#374151] group-hover:bg-[#1f2937] group-hover:text-white transition-colors shrink-0">
                <c.icon size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#1f2937] flex items-center gap-1">
                  {c.title}
                  <ChevronRight size={16} className="text-neutral-400 transition-transform group-hover:translate-x-1" />
                </h3>
                <p className="text-sm text-neutral-500 mt-0.5">{c.desc}</p>
              </div>
            </Link>
          )
        )}
      </div>
    </div>
  );
}
