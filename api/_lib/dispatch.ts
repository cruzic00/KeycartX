// api/_lib/dispatch.ts
// Shared by the [resource]/[action]/[...path] route dispatchers.
//
// Loads the matching handler with a dynamic import inside a try/catch. That
// matters: with static imports a module that throws while loading (an
// ESM-only dependency being require()d, a missing env var read at the top
// level) crashes the whole function before any handler runs, and Vercel can
// only report the opaque FUNCTION_INVOCATION_FAILED. Importing lazily turns
// that into a logged, readable 500.
import type { VercelRequest, VercelResponse } from "@vercel/node";

export type Handler = (req: VercelRequest, res: VercelResponse) => unknown;
export type Routes = Record<string, () => Promise<{ default: Handler }>>;

// Temporary: echo the failure back to the caller so a broken deploy can be
// diagnosed without dashboard access. Remove once /api is healthy - error
// details do not belong in a public response.
const EXPOSE_ERRORS = true;

export async function dispatch(
  req: VercelRequest,
  res: VercelResponse,
  key: string,
  routes: Routes
) {
  const load = routes[key];
  if (!load) return res.status(404).json({ error: "Not found" });

  try {
    const mod = await load();
    return await mod.default(req, res);
  } catch (err: any) {
    console.error(`[api] ${req.method} ${req.url} failed:`, err);
    if (res.headersSent) return;
    return res.status(500).json({
      error: "Server error",
      ...(EXPOSE_ERRORS && {
        detail: String(err?.message ?? err),
        stack: String(err?.stack ?? "").split("\n").slice(0, 6),
      }),
    });
  }
}
