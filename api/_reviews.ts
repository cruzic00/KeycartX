import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createAdminClient } from "./_lib/supabase-admin.js";
import { getCurrentUser } from "./_lib/auth.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { productId, rating, comment, image, reviewer } = req.body ?? {};

    if (!productId || !rating || !comment) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const admin = createAdminClient();

    const lookup = UUID_RE.test(productId)
      ? admin.from("products").select("id").eq("id", productId)
      : admin.from("products").select("id").eq("slug", productId);

    const { data: product } = await lookup.single();
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const user = await getCurrentUser(req, res);

    const { error: insertError } = await admin.from("reviews").insert({
      product_id: product.id,
      user_id: user?.id ?? null,
      reviewer: reviewer || user?.name || "Anonymous",
      text: comment,
      rating: Number(rating),
      image: image || "",
    });

    if (insertError) {
      console.error("review insert error:", insertError.message);
      return res.status(500).json({ error: "Failed to save review" });
    }

    // Recompute aggregate rating + count.
    const { data: all } = await admin
      .from("reviews")
      .select("rating")
      .eq("product_id", product.id);

    const count = all?.length ?? 0;
    const avg = count ? all!.reduce((s, r) => s + (r.rating || 0), 0) / count : 0;

    await admin
      .from("products")
      .update({ rating: Math.round(avg * 10) / 10, reviews_count: count })
      .eq("id", product.id);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error submitting review:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
