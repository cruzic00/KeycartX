// Dispatcher for /api/auth/* - see the comments in api/[resource].ts and
// api/_lib/dispatch.ts for why these are collapsed into one Serverless
// Function and why the handlers are imported lazily.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dispatch } from "../_lib/dispatch";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return dispatch(req, res, String(req.query.action ?? ""), {
    login: () => import("./_login"),
    logout: () => import("./_logout"),
    me: () => import("./_me"),
    register: () => import("./_register"),
    session: () => import("./_session"),
  });
}
