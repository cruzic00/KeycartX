import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createAdminClient } from "../_lib/supabase-admin.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { email, password, name } = req.body ?? {};

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Name, email and password required" });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const admin = createAdminClient();
    const { error } = await admin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (error) {
      const msg = /already/i.test(error.message)
        ? "An account with this email already exists. Please log in."
        : error.message;
      return res.status(400).json({ error: msg });
    }

    return res.status(201).json({ success: true });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
