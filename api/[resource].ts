// Vercel turns every file under api/ into its own Serverless Function, and a
// Hobby-plan deployment is capped at 12 of them. The real handlers now sit
// beside this file with an underscore prefix - Vercel skips those - and this
// single dispatcher fans out to them, so five routes cost one function
// instead of five. The public URLs (/api/cart, /api/products, ...) are
// unchanged, so nothing on the frontend has to move.
//
// The handlers are imported lazily: a static import of all five would make a
// failure in any one of them (a bad module, a missing dependency) take down
// every route in the function, and it would happen at load time, where the
// handler's own try/catch cannot see it. import() inside the try means a
// broken module surfaces as a readable 500 instead of a bare
// FUNCTION_INVOCATION_FAILED - and only the module actually being used gets
// loaded, which keeps cold starts down.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dispatch } from "./_lib/dispatch";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return dispatch(req, res, String(req.query.resource ?? ""), {
    cart: () => import("./_cart"),
    orders: () => import("./_orders"),
    products: () => import("./_products"),
    reviews: () => import("./_reviews"),
    settings: () => import("./_settings"),
  });
}
