// NEW endpoint — the Next.js app read home-page settings directly in the
// root server layout (getHomeSettings()); the SPA needs a public HTTP
// endpoint for that instead. Mirrors the public-fallback pattern already
// used by /api/admin/categories.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getHomeSettings } from "./_lib/settings.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const settings = await getHomeSettings();
  return res.status(200).json(settings);
}
