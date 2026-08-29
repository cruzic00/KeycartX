// api/_lib/auth.ts
// Returns the currently authenticated user (with profile role) or null.
// Port of lib/auth.ts — session lives in Supabase's own cookies.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "./supabase-server.js";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export async function getCurrentUser(
  req: VercelRequest,
  res: VercelResponse
): Promise<CurrentUser | null> {
  const supabase = createClient(req, res);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email ?? "",
    name: profile?.name ?? (user.user_metadata?.name as string) ?? "",
    role: profile?.role ?? "user",
  };
}
