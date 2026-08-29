import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "../_lib/supabase-server.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const supabase = createClient(req, res);
  await supabase.auth.signOut();
  return res.status(200).json({ success: true });
}
