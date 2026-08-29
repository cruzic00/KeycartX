import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MarqueeBanner from "./MarqueeBanner";

// Renders the customer-site chrome (marquee, navbar, footer, constrained main)
// for normal pages, but nothing for /admin — the admin panel has its own layout.
export default function LayoutShell({
  children,
  marquee,
  nav,
}: {
  children: React.ReactNode;
  marquee?: string[];
  nav?: { name: string; href: string }[];
}) {
  const { pathname } = useLocation();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  const hideFooter = ["/cart", "/login", "/register"].includes(pathname || "");

  return (
    <>
      <MarqueeBanner items={marquee} />
      <Navbar links={nav} />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      {!hideFooter && <Footer />}
    </>
  );
}
