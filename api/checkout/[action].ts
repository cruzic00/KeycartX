// Dispatcher for /api/checkout/* - see the comment in api/[resource].ts for
// why these are collapsed into one Serverless Function.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import razorpay from "./_razorpay";
import verify from "./_verify";

type Handler = (req: VercelRequest, res: VercelResponse) => unknown;

const routes: Record<string, Handler> = { razorpay, verify };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const route = routes[String(req.query.action ?? "")];
  if (!route) return res.status(404).json({ error: "Not found" });
  return route(req, res);
}
