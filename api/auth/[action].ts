// Dispatcher for /api/auth/* - see the comments in api/[resource].ts and
// api/_lib/dispatch.ts for why these are collapsed into one Serverless
// Function and why the handlers are imported lazily.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dispatch } from "../_lib/dispatch.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return dispatch(req, res, String(req.query.action ?? ""), {
    callback: () => import("./_callback.js"),
    login: () => import("./_login.js"),
    logout: () => import("./_logout.js"),
    me: () => import("./_me.js"),
    oauth: () => import("./_oauth.js"),
    register: () => import("./_register.js"),
    session: () => import("./_session.js"),
  });
}
