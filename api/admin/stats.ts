// NEW endpoint — app/admin/page.tsx used to call getAdminStats() directly
// as a server component. The SPA needs an HTTP endpoint for that.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../_lib/admin-utils";
import { getAdminStats } from "../_lib/admin-data";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const auth = await requireAdmin(req, res);
  if (!auth.ok) return res.status(auth.code).json({ error: auth.message });

  const stats = await getAdminStats();
  return res.status(200).json(stats);
}
