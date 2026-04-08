import type { Connect } from "vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function spaFallback(): { name: string; configurePreviewServer: (server: { middlewares: Connect.Server }) => void } {
  return {
    name: "spa-fallback",
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        const pathOnly = req.url?.split("?")[0] ?? "";
        if (req.method === "GET" && pathOnly && !pathOnly.includes(".") && pathOnly !== "/index.html") {
          req.url = "/index.html";
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), spaFallback()],
});
