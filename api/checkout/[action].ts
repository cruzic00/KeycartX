// Dispatcher for /api/checkout/* - see the comments in api/[resource].ts and
// api/_lib/dispatch.ts.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dispatch } from "../_lib/dispatch.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return dispatch(req, res, String(req.query.action ?? ""), {
    razorpay: () => import("./_razorpay.js"),
    verify: () => import("./_verify.js"),
  });
}
