import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, LogOut, Package, ShoppingBag, HelpCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const DEFAULT_LINKS = [
  { name: "HOME", href: "/" },
  { name: "NEW ARRIVALS", href: "/products" },
  { name: "ANIME", href: "/anime" },
  { name: "GYM", href: "/gym" },
  { name: "COLLEGE", href: "/college" },
  { name: "MAFIA", href: "/mafia" },
  { name: "OFFICE", href: "/office" },
];

export default function Navbar({ links }: { links?: { name: string; href: string }[] }) {
  const navLinks = (links && links.length ? links : DEFAULT_LINKS).filter(
    (l) => l.href && l.href.trim()
  );
  const { user, loading } = useAuth();
  const { items } = useCart();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const cartCount = items.reduce((sum, item) => sum + item.qty, 0);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/"; // Force full reload to clear state
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hide Navbar on Admin pages (admin panel has its own sidebar)
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-secondary border-b border-black/5 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center">
        <div className="flex-shrink-0">
          {/* Text wordmark: the old logo file is a PNG that reads "MELLO",
              which cannot be edited in code. Swap this back to an <img> once
              a KeyCartX logo asset exists. */}
          <Link to="/" className="group flex items-center h-12">
            <span className="text-2xl font-black tracking-tighter text-[#111827] transition-transform group-hover:scale-105">
              KeyCart<span className="text-neutral-400">X</span>
            </span>
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-10 text-sm font-bold tracking-widest text-primary">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`relative py-1 transition-colors hover:text-accent
                after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px]
                after:bg-accent after:transition-all after:duration-300 hover:after:w-full
                ${pathname === link.href ? "text-accent after:w-full" : "text-gray-500"}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-6 text-primary">
          <Link to="/cart" className="relative hover:text-accent transition-colors group">
            <ShoppingBag size={22} strokeWidth={2} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 bg-accent text-white text-[10px] font-bold rounded-full border border-white">
                {cartCount}
              </span>
            )}
          </Link>

          {!loading && (
            <div className="relative" ref={dropdownRef}>
              {!user ? (
                <Link
                  to={`/login?redirect=${pathname}`}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold tracking-wider rounded-full hover:bg-[#1f2937] transition-all shadow-md hover:shadow-lg"
                >
                  LOGIN
                </Link>
              ) : (
                <div>
                  <button
                    onClick={() => setOpen(!open)}
                    className="flex items-center gap-2 hover:text-accent transition-colors focus:outline-none"
                  >
                    <User size={22} strokeWidth={2} />
                  </button>

                  {open && (
                    <div className="absolute right-0 mt-4 w-64 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5">
                      <div className="bg-gray-50/50 px-5 py-4 border-b border-gray-100 backdrop-blur-sm">
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Signed in as</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                      </div>

                      <div className="p-2 space-y-1">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors"
                          onClick={() => setOpen(false)}
                        >
                          <User size={18} strokeWidth={2} />
                          My Profile
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors"
                          onClick={() => setOpen(false)}
                        >
                          <Package size={18} strokeWidth={2} />
                          My Orders
                        </Link>
                        <a
                          href="mailto:mynonlineshop@gmail.com"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors"
                          onClick={() => setOpen(false)}
                        >
                          <HelpCircle size={18} strokeWidth={2} />
                          Support
                        </a>
                      </div>

                      <div className="border-t border-gray-100 p-2">
                        <button
                          onClick={logout}
                          className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <LogOut size={18} strokeWidth={2} />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
