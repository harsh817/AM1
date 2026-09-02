import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

const isStandaloneBuild = process.env.STANDALONE_BUILD === "1";
const outputDirectory = process.env.VITE_STANDALONE_OUT_DIR || "dist";

export default defineConfig({
  base: "/",
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  build: {
    outDir: outputDirectory,
    rollupOptions: {
      input: isStandaloneBuild
        ? resolve(__dirname, "index.html")
        : {
            main: resolve(__dirname, "index.html"),
            checkout: resolve(__dirname, "checkout.html"),
          },
      output: isStandaloneBuild ? { inlineDynamicImports: true } : undefined,
    },
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react()],
});
