import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../_lib/admin-utils.js";
import { createAdminClient } from "../_lib/supabase-admin.js";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// DB row -> shape the admin Stocks page expects (prices in paisa).
function toAdminShape(row: any) {
  const meta = row.meta ?? {};
  return {
    _id: row.id,
    name: row.title,
    slug: row.slug,
    brand: meta.brand ?? "KeyCartX",
    category: row.category ?? "",
    subCategory: row.sub_category ?? "",
    unit: meta.unit ?? "1pc",
    mrp: row.mrp ?? 0,
    supplierPrice: meta.supplier_price ?? 0,
    cgst: meta.cgst ?? 0,
    sgst: meta.sgst ?? 0,
    commission: meta.commission ?? 0,
    appPrice: row.price ?? 0,
    price: row.price ?? 0,
    status: meta.status ?? (row.in_stock ? "Active" : "Not Active"),
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
    imageUrl: row.image_url ?? "",
    images: Array.isArray(row.images) ? row.images : [],
    aboutItems: row.about_items ?? [],
    reviewsCount: row.reviews_count ?? 0,
    rating: row.rating ?? 0,
    customersSay: meta.customersSay ?? [],
    replacementPolicy: row.replacement_policy ?? "3 days replacement",
    freeDelivery: row.free_delivery ?? true,
    technicalDetails: row.technical_details ?? [],
    recommendation: meta.recommendation ?? [],
    trending: meta.trending ?? false,
    productType: meta.productType ?? "",
    fabric: meta.fabric ?? "",
    fit: meta.fit ?? "",
    closure: meta.closure ?? "",
  };
}

// Admin payload -> DB columns.
function toDbColumns(body: any) {
  return {
    title: body.name,
    price: Math.round(Number(body.price ?? body.appPrice ?? 0)),
    mrp: Math.round(Number(body.mrp ?? 0)),
    sizes: Array.isArray(body.sizes) ? body.sizes.filter((x: string) => String(x).trim()) : [],
    image_url: body.imageUrl ?? "",
    images: Array.isArray(body.images) ? body.images : [],
    category: (body.category ?? "").trim() || "tshirt",
    sub_category: body.subCategory ?? null,
    about_items: body.aboutItems ?? [],
    technical_details: body.technicalDetails ?? [],
    free_delivery: body.freeDelivery ?? true,
    replacement_policy: body.replacementPolicy ?? "3 days replacement",
    rating: Number(body.rating ?? 0),
    reviews_count: Number(body.reviewsCount ?? 0),
    in_stock: body.status ? body.status !== "Not Active" : true,
    meta: {
      brand: body.brand ?? "KeyCartX",
      unit: body.unit ?? "1pc",
      cgst: Number(body.cgst ?? 0),
      sgst: Number(body.sgst ?? 0),
      commission: Number(body.commission ?? 0),
      supplier_price: Math.round(Number(body.supplierPrice ?? 0)),
      status: body.status ?? "Active",
      recommendation: body.recommendation ?? [],
      customersSay: body.customersSay ?? [],
      trending: body.trending ?? false,
      productType: body.productType ?? "",
      fabric: body.fabric ?? "",
      fit: body.fit ?? "",
      closure: body.closure ?? "",
    },
    updated_at: new Date().toISOString(),
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = await requireAdmin(req, res);
  if (!auth.ok) return res.status(auth.code).json({ error: auth.message });

  const admin = createAdminClient();

  if (req.method === "GET") {
    const { data, error } = await admin
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json((data ?? []).map(toAdminShape));
  }

  if (req.method === "POST") {
    try {
      const body = req.body ?? {};
      if (!body.name) {
        return res.status(400).json({ error: "Product name is required" });
      }

      const columns = toDbColumns(body);
      let slug = body.slug || slugify(body.name);

      const { data: existing } = await admin
        .from("products")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (existing) slug = `${slug}-${Math.floor(Math.random() * 1000)}`;

      const { data, error } = await admin
        .from("products")
        .insert({ ...columns, slug })
        .select("id")
        .single();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json({ success: true, id: data.id });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || String(err) });
    }
  }

  if (req.method === "PUT") {
    try {
      const body = req.body ?? {};
      const { _id } = body;
      if (!_id) return res.status(400).json({ error: "Missing Product ID" });

      const { error } = await admin.from("products").update(toDbColumns(body)).eq("id", _id);

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || String(err) });
    }
  }

  if (req.method === "DELETE") {
    const id = typeof req.query.id === "string" ? req.query.id : undefined;
    if (!id) return res.status(400).json({ error: "Missing ID" });

    const { error } = await admin.from("products").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
