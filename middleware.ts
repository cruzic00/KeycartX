import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED = ["/account", "/orders", "/profile"];

// Payment lock: flip to false once the client pays, then redeploy.
const SITE_LOCKED = true;
const UNLOCKED_PREFIXES = ["/admin", "/login", "/api"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (SITE_LOCKED && !UNLOCKED_PREFIXES.some((p) => path.startsWith(p))) {
    return new NextResponse(
      "<!DOCTYPE html><html><head><title>404</title><meta name=\"robots\" content=\"noindex\"></head><body style=\"margin:0;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#333;background:#fff\">404 | This page could not be found.</body></html>",
      { status: 404, headers: { "content-type": "text/html" } }
    );
  }

  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env vars aren't configured (e.g. on a fresh deploy), don't crash —
  // just let the request through unauthenticated.
  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refreshes the session cookie if needed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminPath = path.startsWith("/admin");
  const isProtected = isAdminPath || PROTECTED.some((p) => path.startsWith(p));

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  if (isAdminPath && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Run on everything except Next internals and static assets.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
