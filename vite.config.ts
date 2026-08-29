import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: ".",
  publicDir: "public",
  // Reuse the existing NEXT_PUBLIC_* vars in .env instead of duplicating
  // them under VITE_* — Vite only exposes prefixed vars to client code.
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        // Keep the browser's Host header. The OAuth routes build their
        // redirect URLs from it, and rewriting it to localhost:3001 would
        // send the user back to the bare API server instead of the app.
        changeOrigin: false,
      },
    },
  },
  build: {
    outDir: "dist",
  },
});
