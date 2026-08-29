// Social sign-in buttons for the login and register pages.
//
// These are plain links, not fetch calls: the whole flow is a browser
// redirect (here -> Supabase -> Google -> back to /api/auth/callback), and
// the session cookies are set by the callback on the way back. Doing it with
// fetch would strand the cookies in an XHR response the browser never
// navigates to.
//
// Facebook was wired up and then dropped: it only ever returned
// "Error getting user email from external provider", and it would have needed
// App Review before anyone but the app's own admins could use it at all.
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.7-2 5-4.4 6.6v5.5h7.1c4.2-3.8 6.6-9.5 6.6-16.1z" />
      <path fill="#34A853" d="M24 46c6 0 11-2 14.5-5.4l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8 41 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.8 28.2c-.4-1.3-.7-2.7-.7-4.2s.3-2.9.7-4.2v-5.7H4.5C3 17.1 2.1 20.4 2.1 24s.9 6.9 2.4 9.9l7.3-5.7z" />
      <path fill="#EA4335" d="M24 10.8c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.2 30 2 24 2 15.4 2 8 7 4.5 14.1l7.3 5.7c1.7-5.2 6.5-9 12.2-9z" />
    </svg>
  );
}

export default function OAuthButtons({ redirect = "/" }: { redirect?: string }) {
  const href = (provider: string) =>
    `/api/auth/oauth?provider=${provider}&redirect=${encodeURIComponent(redirect)}`;

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs uppercase tracking-widest text-gray-400">or</span>
        </div>
      </div>

      <a
        href={href("google")}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <GoogleMark />
        Continue with Google
      </a>
    </div>
  );
}
