import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === "production";

  return {
    plugins: [
      react({
        // optional jsx transform options, keep defaults usually
        jsxRuntime: "automatic"
      })
    ],
    root: process.cwd(),
    base: isProd ? "/" : "/",
    build: {
      outDir: "dist/public",
      emptyOutDir: false, // don't remove functions folder if you output functions too
      sourcemap: false,
      target: "es2020"
    },
    resolve: {
      alias: {
        // adjust as needed — example alias for src/
        "@": path.resolve(__dirname, "src")
      }
    },
    server: {
      host: true,
      port: 5173
    },
    optimizeDeps: {
      // ensure these are pre-bundled by Vite
      include: ["react", "react-dom"]
    }
  };
});
                            
