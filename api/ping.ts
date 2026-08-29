// TEMPORARY diagnostic endpoint. Imports nothing, so it answers one question
// the opaque FUNCTION_INVOCATION_FAILED page cannot: do Serverless Functions
// run here at all, and are the env vars actually present? Reports only
// booleans - never the secret values themselves. Delete once /api is healthy.
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({
    ok: true,
    node: process.version,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  });
}
