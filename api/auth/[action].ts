// Dispatcher for /api/auth/* - see the comment in api/[resource].ts for why
// these are collapsed into one Serverless Function.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import login from "./_login";
import logout from "./_logout";
import me from "./_me";
import register from "./_register";
import session from "./_session";

type Handler = (req: VercelRequest, res: VercelResponse) => unknown;

const routes: Record<string, Handler> = { login, logout, me, register, session };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const route = routes[String(req.query.action ?? "")];
  if (!route) return res.status(404).json({ error: "Not found" });
  return route(req, res);
}
