// api/_lib/supabase-admin.ts
// Server-only Supabase client using the service_role key. BYPASSES Row Level
// Security — never expose this to the browser. Port of lib/supabase/admin.ts.
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
