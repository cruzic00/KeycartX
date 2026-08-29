// Port of app/admin/page.tsx. The original was an async server component
// that read getAdminStats()/getAllOrders() directly; here both come from
// GET /api/admin/stats and GET /api/admin/orders via useEffect instead.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, ShoppingBag, Package, DollarSign, Activity } from "lucide-react";

type Stats = { userCount: number; orderCount: number; productCount: number; totalRevenue: number };

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats);
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((d) => setRecentOrders((d.orders || []).slice(0, 5)));
  }, []);

  if (!stats || !recentOrders) {
    return <div className="p-10 text-neutral-500">Loading…</div>;
  }

  const { userCount, orderCount, productCount, totalRevenue } = stats;

  const statCards = [
    {
      title: "Total Revenue",
      value: `₹${(totalRevenue / 100).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-emerald-500",
      change: "+12.5%",
      trend: "up"
    },
    {
      title: "Active Users",
      value: userCount,
      icon: Users,
      color: "bg-blue-500",
      change: "+5.2%",
      trend: "up"
    },
    {
      title: "Total Orders",
      value: orderCount,
      icon: ShoppingBag,
      color: "bg-purple-500",
      change: "+2.1%",
      trend: "up"
    },
    {
      title: "Products",
      value: productCount,
      icon: Package,
      color: "bg-orange-500",
      change: "0%",
      trend: "neutral"
    },
  ];

  return (
    <div className="p-10 space-y-10">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">Dashboard Overview</h1>
          <p className="text-neutral-500 mt-1">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/stocks" className="px-4 py-2 bg-[#111827] text-white rounded-lg text-sm font-semibold hover:bg-[#1f2937] transition shadow-lg shadow-[#111827]/20">
            Manage Products
          </Link>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10 text-${stat.color.split("-")[1]}-600`}>
                <stat.icon size={24} className={stat.color.replace("bg-", "text-")} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-neutral-500 text-sm font-semibold uppercase tracking-wider">{stat.title}</p>
              <h3 className="text-3xl font-extrabold text-[#111827] mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* RECENT ACTIVITY */}
      <div>
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Activity size={20} className="text-neutral-400" />
              Recent Activity
            </h3>
            <Link to="/admin/orders" className="text-sm font-bold text-blue-600 hover:underline">View All</Link>
          </div>

          <div className="space-y-6">
            {recentOrders.length === 0 ? (
              <p className="text-neutral-400 text-sm py-8 text-center">No orders yet.</p>
            ) : (
              recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center gap-4 border-b border-neutral-50 pb-4 last:border-0 last:pb-0">
                  <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center font-bold text-neutral-500 shrink-0">
                    <ShoppingBag size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#111827] truncate">{order.userEmail}</p>
                    <p className="text-xs text-neutral-500">
                      {new Date(order.created_at).toLocaleDateString()} · <span className="capitalize">{order.status}</span>
                    </p>
                  </div>
                  <div className="font-bold text-[#111827]">₹{(order.total / 100).toFixed(2)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
