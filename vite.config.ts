import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const isProd = mode === "production";

  return {
    root: "client",  // <-- client folder
    plugins: [react()],
    base: isProd ? "/" : "/",
    build: {
      outDir: "../dist/public", // build output relative to project root
      emptyOutDir: true,
      sourcemap: false,
      target: "es2020"
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client/src")
      }
    },
    server: {
      host: true,
      port: 5173
    }
  };
});
