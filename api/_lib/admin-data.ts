// api/_lib/admin-data.ts — port of lib/admin-data.ts (drops next/cache).
// Uses the service-role client; every caller must already be behind requireAdmin().
import { createAdminClient } from "./supabase-admin";
import { withTtlCache } from "./cache";

const fetchUserEmailEntries = withTtlCache(async (): Promise<[string, string][]> => {
  const admin = createAdminClient();
  try {
    const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    return (data?.users ?? []).map((u) => [u.id, u.email ?? ""] as [string, string]);
  } catch (e) {
    console.error("listUserEmails error", e);
    return [];
  }
}, 300_000);

export async function listUserEmails(): Promise<Map<string, string>> {
  return new Map(await fetchUserEmailEntries());
}

export async function getAllOrders() {
  const admin = createAdminClient();
  const [{ data: orders }, emails] = await Promise.all([
    admin
      .from("orders")
      .select("id, user_id, items, total, payment, status, created_at")
      .order("created_at", { ascending: false }),
    listUserEmails(),
  ]);

  return (orders ?? []).map((o: any) => ({
    ...o,
    userEmail: o.user_id ? emails.get(o.user_id) ?? "—" : "Guest",
  }));
}

export async function getAllUsers() {
  const admin = createAdminClient();
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, name, role, created_at")
    .order("created_at", { ascending: false });
  const emails = await listUserEmails();

  return (profiles ?? []).map((p: any) => ({
    ...p,
    email: emails.get(p.id) ?? "—",
  }));
}

export async function getAdminStats() {
  const admin = createAdminClient();
  const [users, orders, products, revenue] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("orders").select("*", { count: "exact", head: true }),
    admin.from("products").select("*", { count: "exact", head: true }),
    admin.from("orders").select("total"),
  ]);

  const totalRevenue = (revenue.data ?? []).reduce(
    (s: number, r: any) => s + (r.total || 0),
    0
  );

  return {
    userCount: users.count ?? 0,
    orderCount: orders.count ?? 0,
    productCount: products.count ?? 0,
    totalRevenue,
  };
}
