import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getProducts, getProductBySlug } from "./_lib/products-db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const slug = typeof req.query.slug === "string" ? req.query.slug : undefined;
  const category = typeof req.query.category === "string" ? req.query.category : undefined;

  try {
    if (slug) {
      const product = await getProductBySlug(slug);
      if (!product) {
        return res.status(404).json({ error: "Not found" });
      }
      return res.status(200).json(product);
    }

    const products = await getProducts(category ? { category } : {});
    return res.status(200).json(products);
  } catch (err) {
    console.error("[api/products] error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
