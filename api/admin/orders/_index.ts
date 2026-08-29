// NEW endpoint — app/admin/orders/page.tsx used to call getAllOrders()
// directly as a server component. The SPA needs an HTTP endpoint for that.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../../_lib/admin-utils.js";
import { getAllOrders } from "../../_lib/admin-data.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const auth = await requireAdmin(req, res);
  if (!auth.ok) return res.status(auth.code).json({ error: auth.message });

  const orders = await getAllOrders();
  return res.status(200).json({ orders });
}
