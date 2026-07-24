import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "../../../../lib/admin-utils";
import { createAdminClient } from "../../../../lib/supabase/admin";

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
    brand: meta.brand ?? "Mello",
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
      brand: body.brand ?? "Mello",
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

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.code });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(toAdminShape));
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.code });

  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    const admin = createAdminClient();
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

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidateTag("products");
    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.code });

  try {
    const body = await req.json();
    const { _id } = body;
    if (!_id) return NextResponse.json({ error: "Missing Product ID" }, { status: 400 });

    const admin = createAdminClient();
    const { error } = await admin
      .from("products")
      .update(toDbColumns(body))
      .eq("id", _id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidateTag("products");
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.code });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidateTag("products");
  return NextResponse.json({ success: true });
}
