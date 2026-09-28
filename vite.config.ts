import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    rollupOptions: {
      output: {
        // Split large, rarely-changing vendors into their own long-cached chunks.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (/node_modules\/(react|react-dom|scheduler|react-router)\//.test(id)) return "react";
          if (id.includes("@radix-ui") || id.includes("@floating-ui")) return "radix";
          return undefined;
        },
      },
    },
  },
  server: {
    port: 5173,
    // In development the API is reached through this proxy, so VITE_API_URL can stay empty.
    proxy: {
      "/api": { target: "http://localhost:4000", changeOrigin: true },
    },
  },
});
