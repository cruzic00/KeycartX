// src/lib/supabase.ts
// Browser-side Supabase client. Uses createBrowserClient (not plain
// createClient) so the session lives in cookies, in the same format the
// /api serverless functions read via their cookie adapter — this is what
// lets auth stay cookie-based end to end instead of switching to bearer
// tokens. Port of lib/supabase/client.ts.
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string,
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );
}
