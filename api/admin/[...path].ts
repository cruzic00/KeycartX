// Dispatcher for /api/admin/* - see the comments in api/[resource].ts and
// api/_lib/dispatch.ts.
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
import { dispatch, type Routes } from "../_lib/dispatch.js";

const routes: Routes = {
  categories: () => import("./_categories.js"),
  settings: () => import("./_settings.js"),
  stats: () => import("./_stats.js"),
  stocks: () => import("./_stocks.js"),
  users: () => import("./_users.js"),
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const raw = req.query.path;
  const segments = Array.isArray(raw) ? raw : raw ? [String(raw)] : [];

  if (segments[0] === "orders") {
    if (segments.length === 1) {
      return dispatch(req, res, "index", { index: () => import("./orders/_index.js") });
    }
    if (segments.length === 2) {
      // orders/_id.ts reads req.query.id, which the file-based route used to
      // supply from its [id] segment.
      req.query.id = segments[1];
      return dispatch(req, res, "id", { id: () => import("./orders/_id.js") });
    }
    return res.status(404).json({ error: "Not found" });
  }

  return dispatch(req, res, segments.length === 1 ? segments[0] : "", routes);
}
