// api/_lib/supabase-public.ts
// Cookie-free anon client for PUBLIC reads (products, settings, reviews).
// Port of lib/supabase/public.ts.
import { createClient } from "@supabase/supabase-js";

export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
