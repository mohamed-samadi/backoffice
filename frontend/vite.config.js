import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const proxyTarget = process.env.VITE_DEV_PROXY_TARGET || "http://localhost:8000";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  server: {
    proxy: {
      "/api": {
        target: proxyTarget,
        changeOrigin: true,
      },
      "/sanctum": {
        target: proxyTarget,
        changeOrigin: true,
      },
      "/storage": {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
  },
});
