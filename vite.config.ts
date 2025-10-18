// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const isProd = mode === "production";

  return {
    plugins: [
      react({
        jsxRuntime: "automatic"
      })
    ],
    // Point Vite to your actual frontend folder
    root: path.resolve(__dirname, "client"),

    base: isProd ? "/" : "/",

    build: {
      //  Output to Cloudflare Pages dist folder
      outDir: path.resolve(__dirname, "dist/public"),
      emptyOutDir: true,
      sourcemap: false,
      target: "es2020",
      rollupOptions: {
        // Explicitly tell Vite where the entry HTML file is
        input: path.resolve(__dirname, "client/index.html")
      }
    },

    resolve: {
      alias: {
        // Make sure @ points to your client/src
        "@": path.resolve(__dirname, "client/src")
      }
    },

    server: {
      host: true,
      port: 5173
    },

    optimizeDeps: {
      include: ["react", "react-dom"]
    }
  };
});
