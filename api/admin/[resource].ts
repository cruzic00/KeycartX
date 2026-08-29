// Dispatcher for /api/admin/* - see the comments in api/[resource].ts and
// api/_lib/dispatch.ts for why these are collapsed into one Serverless
// Function and why the handlers are imported lazily.
//
// This deliberately uses a single [resource] segment rather than a
// [...path] catch-all. The catch-all shape deployed fine but its parameter
// never arrived as expected on Vercel, so every /api/admin/* route fell
// through to a 404 - while the plain [resource]/[action] segment used by the
// other dispatchers worked. /api/admin/orders/:id is a real file-based route
// again (orders/[id].ts), so no catch-all is needed here.
//
// api/admin/upload.ts stays its own function: it sets
// `config.api.bodyParser = false` so formidable can read the raw multipart
// stream, and that config would apply to this whole function - leaving every
// other admin route with an unparsed req.body. Vercel matches the static
// /api/admin/upload route ahead of this dynamic one.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dispatch } from "../_lib/dispatch.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return dispatch(req, res, String(req.query.resource ?? ""), {
    categories: () => import("./_categories.js"),
    settings: () => import("./_settings.js"),
    stats: () => import("./_stats.js"),
    stocks: () => import("./_stocks.js"),
    users: () => import("./_users.js"),
    orders: () => import("./orders/_index.js"),
  });
}
