import "../styles/globals.css";
import React from "react";
import Providers from "./providers";
import LayoutShell from "../components/LayoutShell";
import { getHomeSettings } from "../lib/settings";

export const metadata = {
  title: "Mello",
  description: "Customize your T-shirt with your designs",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getHomeSettings();

  return (
    <html lang="en">
      <body className="bg-secondary text-primary antialiased font-sans">
        <Providers>
          <LayoutShell marquee={settings.marquee} nav={settings.nav}>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}
