import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../_lib/admin-utils.js";
import { createAdminClient } from "../_lib/supabase-admin.js";
import { getAllUsers } from "../_lib/admin-data.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = await requireAdmin(req, res);
  if (!auth.ok) return res.status(auth.code).json({ error: auth.message });

  // GET is NEW — app/admin/users/page.tsx used to call getAllUsers()
  // directly as a server component; the SPA needs an HTTP endpoint for it.
  if (req.method === "GET") {
    const users = await getAllUsers();
    return res.status(200).json({ users });
  }

  if (req.method === "DELETE") {
    const id = String(req.query.id ?? "");
    if (!id) return res.status(400).json({ error: "Missing user id" });

    if (id === auth.user.id) {
      return res.status(400).json({ error: "You can't delete your own account." });
    }

    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
