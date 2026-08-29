import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "./_lib/supabase-server.js";
import { getCurrentUser } from "./_lib/auth.js";
import { createAdminClient } from "./_lib/supabase-admin.js";

// Place an order directly (payment temporarily disabled — Cash on Delivery).
async function placeOrder(req: VercelRequest, res: VercelResponse) {
  const user = await getCurrentUser(req, res);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { items, total, shipping } = req.body ?? {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .insert({
      user_id: user.id,
      items,
      total: total ?? 0,
      shipping: shipping ?? {},
      payment: { provider: "cod", status: "pending" },
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    console.error("order create error:", error.message);
    return res.status(500).json({ error: "Failed to create order" });
  }

  await admin.from("carts").delete().eq("user_id", user.id);
  return res.status(200).json({ success: true, orderId: data.id });
}

// Returns the signed-in user's orders. Order creation also happens
// server-side in /api/checkout/verify after a verified Razorpay payment.
async function listOrders(req: VercelRequest, res: VercelResponse) {
  const supabase = createClient(req, res);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { data, error } = await supabase
    .from("orders")
    .select("id, items, total, payment, status, shipping, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: "Failed to fetch orders" });
  }

  return res.status(200).json({ orders: data ?? [] });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "POST") return placeOrder(req, res);
  if (req.method === "GET") return listOrders(req, res);
  return res.status(405).json({ error: "Method not allowed" });
}
