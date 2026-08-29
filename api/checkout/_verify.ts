import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { getCurrentUser } from "../_lib/auth";
import { createAdminClient } from "../_lib/supabase-admin";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      shipping,
      total,
    } = req.body ?? {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment fields" });
    }

    // Verify the signature server-side — never trust the client.
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const user = await getCurrentUser(req, res);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const admin = createAdminClient();
    const { data: order, error } = await admin
      .from("orders")
      .insert({
        user_id: user.id,
        items: items ?? [],
        total: total ?? 0,
        shipping: shipping ?? {},
        payment: {
          provider: "razorpay",
          status: "paid",
          razorpay_order_id,
          razorpay_payment_id,
        },
        status: "paid",
      })
      .select("id")
      .single();

    if (error) {
      console.error("order insert error:", error.message);
      return res.status(500).json({ error: "Failed to save order" });
    }

    // Clear the user's cart now that the order is placed.
    await admin.from("carts").delete().eq("user_id", user.id);

    return res.status(200).json({ success: true, orderId: order?.id });
  } catch (err) {
    console.error("verify error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
