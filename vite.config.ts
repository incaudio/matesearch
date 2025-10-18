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
    root: process.cwd(),
    base: isProd ? "/" : "/",
    build: {
      outDir: "dist/public",
      emptyOutDir: false,
      sourcemap: false,
      target: "es2020"
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src")
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
