// api/_lib/supabase-server.ts
// Cookie-bound Supabase client for Vercel Node functions — port of
// lib/supabase/server.ts, swapping next/headers' cookies() for the
// request/response cookie adapter in api/_lib/cookies.ts.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createServerClient } from "@supabase/ssr";
import { applySetCookies, getRequestCookies, type CookieToSet } from "./cookies";

export function createClient(req: VercelRequest, res: VercelResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return getRequestCookies(req);
        },
        setAll(cookiesToSet: CookieToSet[]) {
          applySetCookies(res, cookiesToSet);
        },
      },
    }
  );
}
