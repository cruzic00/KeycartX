// api/_lib/admin-utils.ts — port of lib/admin-utils.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getCurrentUser, type CurrentUser } from "./auth.js";

type AdminResult =
  | { ok: true; user: CurrentUser }
  | { ok: false; code: number; message: string };

export async function requireAdmin(req: VercelRequest, res: VercelResponse): Promise<AdminResult> {
  const user = await getCurrentUser(req, res);
  if (!user) return { ok: false, code: 401, message: "Not authenticated" };
  if (user.role !== "admin") {
    return { ok: false, code: 403, message: "Admin access required" };
  }
  return { ok: true, user };
}
