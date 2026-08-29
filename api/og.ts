// Link-preview metadata for /products/:slug.
//
// The storefront is a Vite SPA: index.html ships one fixed set of meta tags
// and React fills the page in afterwards. Link-preview crawlers do not run
// JavaScript, so WhatsApp, Telegram and the rest only ever saw the generic
// site title - every product link previewed identically.
//
// vercel.json rewrites /products/:slug here when the User-Agent is one of
// those crawlers, so this returns the same page described properly: product
// title, photo, price and a Buy now link. Real visitors are untouched and
// still get the SPA. Search engines are deliberately NOT routed here - they
// render JavaScript, and serving them a different document than people get
// would be cloaking.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getProductBySlug } from "./_lib/products-db.js";

const SITE = "KeyCartX";
const TAGLINE = "Premium drops, delivered to your door.";

function esc(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rupees(paisa: number) {
  return `₹${Math.round(paisa / 100)}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = typeof req.query.slug === "string" ? req.query.slug : "";
  const proto = (req.headers["x-forwarded-proto"] as string) || "https";
  const origin = `${proto}://${req.headers.host}`;

  let title = SITE;
  let description = TAGLINE;
  let image = "";
  let url = origin;
  const extra: string[] = [];

  try {
    const product = slug ? await getProductBySlug(slug) : null;
    if (product) {
      url = `${origin}/products/${encodeURIComponent(product.slug)}`;
      title = product.name;

      // The description is the only line WhatsApp shows under the title, so
      // lead with what a buyer decides on: price, then the saving.
      const bits = [rupees(product.price)];
      if (product.mrp && product.mrp > product.price) {
        bits.push(
          `${rupees(product.mrp)} (${Math.round((1 - product.price / product.mrp) * 100)}% OFF)`
        );
      }
      if (product.freeDelivery) bits.push("Free delivery");
      bits.push(`Buy now on ${SITE}`);
      description = bits.join("  ·  ");

      image = product.image?.startsWith("/") ? origin + product.image : product.image || "";

      extra.push(
        `<meta property="product:price:amount" content="${esc((product.price / 100).toFixed(2))}" />`,
        `<meta property="product:price:currency" content="INR" />`,
        `<meta property="og:availability" content="${product.inStock ? "in stock" : "out of stock"}" />`
      );
    }
  } catch (err) {
    // A preview is never worth failing the page over - fall back to the
    // generic site card.
    console.error("[api/og] lookup failed:", err);
  }

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${esc(url)}" />
<meta property="og:site_name" content="${SITE}" />
<meta property="og:type" content="${slug ? "product" : "website"}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${esc(url)}" />
${image ? `<meta property="og:image" content="${esc(image)}" />
<meta property="og:image:alt" content="${esc(title)}" />` : ""}
<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
${image ? `<meta name="twitter:image" content="${esc(image)}" />` : ""}
${extra.join("\n")}
</head>
<body>
<h1>${esc(title)}</h1>
<p>${esc(description)}</p>
${image ? `<img src="${esc(image)}" alt="${esc(title)}" width="480" />` : ""}
<p><a href="${esc(url)}">Buy now on ${SITE}</a></p>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  // Crawlers re-fetch on their own schedule; a short cache keeps a link that
  // gets pasted repeatedly from hitting the database every time.
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300");
  return res.status(200).send(html);
}
