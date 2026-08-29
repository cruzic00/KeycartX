// api/_lib/cookies.ts
// Cookie adapter for @supabase/ssr on Vercel Node functions — replaces
// next/headers' cookies() from the old lib/supabase/server.ts. Reads the
// incoming Cookie header and collects outgoing Set-Cookie headers so
// createServerClient can rotate/refresh the Supabase session per-request.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { parseCookie, stringifySetCookie, type SerializeOptions } from "cookie";

export type CookieToSet = { name: string; value: string; options?: SerializeOptions };

export function getRequestCookies(req: VercelRequest) {
  const header = req.headers.cookie;
  if (!header) return [] as { name: string; value: string }[];
  const parsed = parseCookie(header);
  return Object.entries(parsed)
    .filter((entry): entry is [string, string] => entry[1] !== undefined)
    .map(([name, value]) => ({ name, value }));
}

export function applySetCookies(res: VercelResponse, cookiesToSet: CookieToSet[]) {
  if (!cookiesToSet.length) return;
  const existing = res.getHeader("Set-Cookie");
  const prev = Array.isArray(existing) ? existing.map(String) : existing ? [String(existing)] : [];
  const next = cookiesToSet.map(({ name, value, options }) =>
    stringifySetCookie({ name, value, ...options })
  );
  res.setHeader("Set-Cookie", [...prev, ...next]);
}
