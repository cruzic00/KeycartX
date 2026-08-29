// Client-side replacement for app/layout.tsx's async getHomeSettings() call
// (server component) — fetches the same data from the new GET /api/settings
// endpoint instead, then renders the same LayoutShell (marquee/nav) + the
// AnimatePresence page-transition wrapper that used to live in app/template.tsx.
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import LayoutShell from "./components/LayoutShell";
import PageTransition from "./components/PageTransition";
import type { HomeSettings } from "../api/_lib/settings";

export default function RootShell() {
  const [settings, setSettings] = useState<Pick<HomeSettings, "marquee" | "nav"> | null>(null);
  const location = useLocation();

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setSettings({ marquee: data.marquee, nav: data.nav }))
      .catch(() => setSettings({ marquee: [], nav: [] }));
  }, []);

  return (
    <LayoutShell marquee={settings?.marquee} nav={settings?.nav}>
      <AnimatePresence mode="wait">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </AnimatePresence>
    </LayoutShell>
  );
}
