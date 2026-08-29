import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "./_lib/supabase-server.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabase = createClient(req, res);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (req.method === "GET") {
    if (!user) return res.status(200).json({ cart: [] });

    const { data } = await supabase
      .from("carts")
      .select("items")
      .eq("user_id", user.id)
      .single();

    return res.status(200).json({ cart: data?.items ?? [] });
  }

  if (req.method === "POST") {
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { cart } = req.body ?? {};

    const { error } = await supabase.from("carts").upsert({
      user_id: user.id,
      items: cart ?? [],
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("cart upsert error:", error.message);
      return res.status(500).json({ error: "Failed to update cart" });
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
