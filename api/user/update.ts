import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "../_lib/supabase-server.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "PUT") return res.status(405).json({ error: "Method not allowed" });

  const supabase = createClient(req, res);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { username, phone, profilePicture } = req.body ?? {};

    const updateDoc: Record<string, any> = {};
    if (username !== undefined) updateDoc.name = username;
    if (phone !== undefined) updateDoc.phone = phone;
    if (profilePicture !== undefined) updateDoc.avatar_url = profilePicture;

    const { error } = await supabase.from("profiles").update(updateDoc).eq("id", user.id);

    if (error) {
      console.error("Profile update error:", error.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    return res.status(200).json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
