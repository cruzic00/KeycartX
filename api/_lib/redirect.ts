// api/_lib/redirect.ts
// Sanitises a caller-supplied "where to go next" value.
//
// The OAuth endpoints carry this through a round trip to Google or Facebook
// and back, so it is attacker-controllable. Anything other than a plain
// same-site path is dropped: without this, /api/auth/oauth?redirect=https://
// evil.example would hand a freshly signed-in visitor to another site, with
// the login looking entirely legitimate up to that point.
export function safeRedirect(value: unknown, fallback = "/") {
  if (typeof value !== "string" || !value) return fallback;
  // "//host" and "/\host" are protocol-relative - they leave the site.
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
