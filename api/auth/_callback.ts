// GET /api/auth/callback?code=...&redirect=/some/path
//
// Where Google/Facebook (via Supabase) land the browser after sign-in.
// Trades the one-time code for a session, which writes the same cookies the
// password login sets, so everything downstream - getCurrentUser,
// requireAdmin, the cart - works identically no matter how the user signed in.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "../_lib/supabase-server.js";
import { getCurrentUser } from "../_lib/auth.js";
import { safeRedirect } from "../_lib/redirect.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const redirect = safeRedirect(req.query.redirect);

  // The provider reports a refusal here: the user pressed Cancel, or the app
  // is not approved for that account.
  const denied =
    typeof req.query.error_description === "string"
      ? req.query.error_description
      : typeof req.query.error === "string"
        ? req.query.error
        : "";
  if (denied) {
    return res.redirect(302, "/login?error=" + encodeURIComponent(denied));
  }

  const code = typeof req.query.code === "string" ? req.query.code : "";
  if (!code) {
    return res.redirect(302, "/login?error=" + encodeURIComponent("Sign-in was not completed"));
  }

  const supabase = createClient(req, res);
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[api/auth/callback]", error);
    return res.redirect(302, "/login?error=" + encodeURIComponent("Could not complete sign-in"));
  }

  // Match what the password login does: send admins to the panel, unless the
  // visitor was already headed somewhere specific.
  if (redirect === "/") {
    const user = await getCurrentUser(req, res);
    if (user?.role === "admin") return res.redirect(302, "/admin");
  }

  return res.redirect(302, redirect);
}
