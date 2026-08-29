// Port of app/admin/layout.tsx — the server-side auth+role redirect now
// lives in RequireAdmin (../../RequireAdmin.tsx); this just renders the shell.
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import { useAuth } from "../../context/AuthContext";
import RequireAdmin from "../../RequireAdmin";

function AdminShell() {
  const { user } = useAuth();
  const adminUser = { username: user?.name || "Admin", email: user?.email ?? "" };

  return (
    <div className="min-h-screen bg-neutral-50 flex font-sans text-[#1f2937]">
      <aside className="w-72 bg-[#1f2937] text-white flex-col hidden md:flex shadow-2xl z-20 sticky top-0 h-screen">
        <Sidebar user={adminUser} />
      </aside>

      <main className="flex-1 relative overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <RequireAdmin>
      <AdminShell />
    </RequireAdmin>
  );
}
