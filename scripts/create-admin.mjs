// Creates (or updates) an admin user in Supabase.
// Usage:  node scripts/create-admin.mjs [email] [password] [name]
// Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from
// .env.local, falling back to .env.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// Credentials come from the command line; these are only the fallbacks.
const [argEmail, argPassword, argName] = process.argv.slice(2);
const ADMIN_EMAIL = argEmail || "admin@gmail.com";
const ADMIN_PASSWORD = argPassword || "password123";
const ADMIN_NAME = argName || "Admin";

// Minimal env parser (Node doesn't auto-load these files).
// .env.local wins over .env, matching the old Next.js precedence.
function loadEnv() {
  const env = {};
  for (const file of ["../.env", "../.env.local"]) {
    try {
      const raw = readFileSync(new URL(file, import.meta.url), "utf8");
      for (const line of raw.split("\n")) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    } catch {
      // File may not exist — that's fine as long as the other one has the keys.
    }
  }
  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error("Could not read Supabase config from .env or .env.local");
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey || serviceKey.includes("PUT_YOUR")) {
  console.error(
    "\n❌ Missing/placeholder SUPABASE_SERVICE_ROLE_KEY in .env / .env.local.\n" +
      "   Get the service_role (or sb_secret_...) key from Supabase → Settings → API,\n" +
      "   paste it into .env, then run this again.\n"
  );
  process.exit(1);
}

// A publishable/anon key here would fail later with a confusing RLS error —
// catch the mix-up up front, since only service_role can create users.
if (serviceKey.startsWith("sb_publishable_")) {
  console.error(
    "\n❌ SUPABASE_SERVICE_ROLE_KEY holds a PUBLISHABLE key.\n" +
      "   That key cannot create users. Copy the Secret key (sb_secret_...)\n" +
      "   or the legacy service_role key from Supabase → Settings → API Keys.\n"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  // 1. Create the auth user (email pre-confirmed so you can log in immediately).
  let userId;
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { name: ADMIN_NAME },
  });

  if (createErr) {
    if (/already/i.test(createErr.message)) {
      // User exists — find them and reset the password.
      const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const existing = list?.users.find((u) => u.email === ADMIN_EMAIL);
      if (!existing) throw createErr;
      userId = existing.id;
      await supabase.auth.admin.updateUserById(userId, {
        password: ADMIN_PASSWORD,
        email_confirm: true,
      });
      console.log("ℹ️  User already existed — password reset.");
    } else {
      throw createErr;
    }
  } else {
    userId = created.user.id;
    console.log("✅ User created.");
  }

  // 2. Promote to admin (upsert in case the profile trigger hasn't run yet).
  const { error: profErr } = await supabase
    .from("profiles")
    .upsert({ id: userId, name: ADMIN_NAME, role: "admin" });
  if (profErr) throw profErr;

  console.log("\n🎉 Admin ready!");
  console.log("   Email:    " + ADMIN_EMAIL);
  console.log("   Password: " + ADMIN_PASSWORD);
  console.log("\n   Login at /login then open /admin\n");
}

main().catch((e) => {
  console.error("Failed:", e.message || e);
  process.exit(1);
});
