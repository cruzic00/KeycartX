import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getCurrentUser } from "../_lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await getCurrentUser(req, res);
  if (!user) {
    return res.status(200).json({ loggedIn: false });
  }

  return res.status(200).json({
    loggedIn: true,
    user: { name: user.name, email: user.email, role: user.role },
  });
}
