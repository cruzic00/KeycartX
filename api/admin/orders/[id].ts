import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../../_lib/admin-utils";
import { createAdminClient } from "../../_lib/supabase-admin";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = await requireAdmin(req, res);
  if (!auth.ok) return res.status(auth.code).json({ error: auth.message });

  const id = String(req.query.id);
  const admin = createAdminClient();

  // GET is NEW — app/admin/orders/[id]/page.tsx used to read the order
  // directly as a server component; the SPA needs an HTTP endpoint for it.
  if (req.method === "GET") {
    const { data, error } = await admin
      .from("orders")
      .select("id, user_id, items, total, payment, status, shipping, created_at")
      .eq("id", id)
      .single();

    if (error || !data) return res.status(404).json({ error: "Order not found" });
    return res.status(200).json({ order: data });
  }

  if (req.method === "PATCH") {
    const { status, tracking } = req.body ?? {};

    // Merge tracking into the shipping jsonb (preserve any existing fields).
    const { data: existing } = await admin
      .from("orders")
      .select("shipping")
      .eq("id", id)
      .single();

    const shipping = {
      ...(existing?.shipping ?? {}),
      ...(tracking !== undefined ? { tracking } : {}),
    };

    const update: Record<string, any> = { shipping, updated_at: new Date().toISOString() };
    if (status) update.status = status;

    const { error } = await admin.from("orders").update(update).eq("id", id);
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ success: true });
  }

  if (req.method === "DELETE") {
    const { error } = await admin.from("orders").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
