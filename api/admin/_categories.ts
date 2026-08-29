import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../_lib/admin-utils.js";
import { createAdminClient } from "../_lib/supabase-admin.js";
import { DEFAULT_CATEGORIES } from "../_lib/settings.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = await requireAdmin(req, res);
  if (!auth.ok) return res.status(auth.code).json({ error: auth.message });

  if (req.method === "GET") {
    const admin = createAdminClient();
    const { data } = await admin.from("site_settings").select("data").eq("id", 1).single();
    const cats = (data?.data as any)?.categories;
    return res.status(200).json({
      categories: Array.isArray(cats) && cats.length ? cats : DEFAULT_CATEGORIES,
    });
  }

  if (req.method === "PUT") {
    try {
      const { categories } = req.body ?? {};
      const admin = createAdminClient();
      const { data: existing } = await admin
        .from("site_settings")
        .select("data")
        .eq("id", 1)
        .single();
      const merged = { ...(existing?.data ?? {}), categories: categories ?? [] };
      const { error } = await admin
        .from("site_settings")
        .upsert({ id: 1, data: merged, updated_at: new Date().toISOString() });

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
