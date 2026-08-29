import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../../_lib/admin-utils.js";
import { createAdminClient } from "../../_lib/supabase-admin.js";
import { listUserEmails } from "../../_lib/admin-data.js";
import { sendEmail, orderStatusEmail } from "../../_lib/email.js";

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

    const emails = await listUserEmails();
    const userEmail = data.user_id ? emails.get(data.user_id) ?? "—" : "Guest";
    return res.status(200).json({ order: { ...data, userEmail } });
  }

  if (req.method === "PATCH") {
    const { status, tracking } = req.body ?? {};

    // Merge tracking into the shipping jsonb (preserve any existing fields).
    const { data: existing } = await admin
      .from("orders")
      .select("user_id, total, status, shipping")
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

    // Only on an actual change of status - re-saving an order to add a
    // tracking number should not mail the customer "shipped" a second time.
    if (status && existing && status !== existing.status) {
      const mail = orderStatusEmail({ id, total: existing.total, shipping }, status);
      if (mail && existing.user_id) {
        const emails = await listUserEmails();
        await sendEmail({ to: emails.get(existing.user_id) ?? "", ...mail });
      }
    }

    return res.status(200).json({ success: true });
  }

  if (req.method === "DELETE") {
    const { error } = await admin.from("orders").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
