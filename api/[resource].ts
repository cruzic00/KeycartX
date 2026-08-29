// Vercel turns every file under api/ into its own Serverless Function, and a
// Hobby-plan deployment is capped at 12 of them. The real handlers now sit
// beside this file with an underscore prefix - Vercel skips those - and this
// single dispatcher fans out to them, so five routes cost one function
// instead of five. The public URLs (/api/cart, /api/products, ...) are
// unchanged, so nothing on the frontend has to move.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import cart from "./_cart";
import orders from "./_orders";
import products from "./_products";
import reviews from "./_reviews";
import settings from "./_settings";

type Handler = (req: VercelRequest, res: VercelResponse) => unknown;

const routes: Record<string, Handler> = { cart, orders, products, reviews, settings };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const route = routes[String(req.query.resource ?? "")];
  if (!route) return res.status(404).json({ error: "Not found" });
  return route(req, res);
}
