// Dispatcher for /api/admin/* - see the comment in api/[resource].ts for why
// these are collapsed into one Serverless Function.
//
// A catch-all (rather than a single [resource] segment) because the orders
// routes are two levels deep: /api/admin/orders and /api/admin/orders/:id.
//
// api/admin/upload.ts is deliberately NOT folded in here: it sets
// `config.api.bodyParser = false` so formidable can read the raw multipart
// stream itself, and that config would apply to the whole function - leaving
// every other admin route with an unparsed req.body. Vercel matches the
// static /api/admin/upload route ahead of this catch-all, so it still works.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import categories from "./_categories";
import settings from "./_settings";
import stats from "./_stats";
import stocks from "./_stocks";
import users from "./_users";
import ordersIndex from "./orders/_index";
import orderDetail from "./orders/_id";

type Handler = (req: VercelRequest, res: VercelResponse) => unknown;

const routes: Record<string, Handler> = { categories, settings, stats, stocks, users };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const raw = req.query.path;
  const segments = Array.isArray(raw) ? raw : raw ? [String(raw)] : [];

  if (segments[0] === "orders") {
    if (segments.length === 1) return ordersIndex(req, res);
    if (segments.length === 2) {
      // orders/_id.ts reads req.query.id, which the file-based route used to
      // supply from its [id] segment.
      req.query.id = segments[1];
      return orderDetail(req, res);
    }
    return res.status(404).json({ error: "Not found" });
  }

  const route = segments.length === 1 ? routes[segments[0]] : undefined;
  if (!route) return res.status(404).json({ error: "Not found" });
  return route(req, res);
}
