// GET /api/auth/oauth?provider=google|facebook&redirect=/some/path
//
// Starts a social sign-in. This runs on the server rather than in the
// browser because the whole app's session lives in cookies that only the
// /api functions write - signInWithOAuth here stores the PKCE verifier
// through the same cookie adapter, which is what lets the callback finish
// the exchange.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "../_lib/supabase-server.js";
import { safeRedirect } from "../_lib/redirect.js";

const PROVIDERS = new Set(["google", "facebook"]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const provider = String(req.query.provider ?? "");
  if (!PROVIDERS.has(provider)) {
    return res.redirect(302, "/login?error=" + encodeURIComponent("Unsupported sign-in method"));
  }

  const redirect = safeRedirect(req.query.redirect);
  const proto = (req.headers["x-forwarded-proto"] as string) || "http";
  const origin = `${proto}://${req.headers.host}`;

  const supabase = createClient(req, res);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as "google" | "facebook",
    options: {
      redirectTo: `${origin}/api/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      // We issue the redirect ourselves so the Set-Cookie headers written
      // above go out with it.
      skipBrowserRedirect: true,
    },
  });

  if (error || !data?.url) {
    // Most likely the provider is not enabled in the Supabase dashboard yet.
    console.error("[api/auth/oauth]", provider, error);
    return res.redirect(
      302,
      "/login?error=" + encodeURIComponent(`${provider} sign-in is not available right now`)
    );
  }

  return res.redirect(302, data.url);
}
