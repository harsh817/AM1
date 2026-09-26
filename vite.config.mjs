import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const isStandaloneBuild = process.env.STANDALONE_BUILD === "1";
const outputDirectory = process.env.VITE_STANDALONE_OUT_DIR || "dist";
const projectDirectory = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "/",
  optimizeDeps: {
    entries: ["index.html", "checkout.html"],
    include: ["react", "react-dom/client"],
  },
  build: {
    outDir: outputDirectory,
    rollupOptions: {
      input: isStandaloneBuild
        ? resolve(projectDirectory, "index.html")
        : {
            main: resolve(projectDirectory, "index.html"),
            checkout: resolve(projectDirectory, "checkout.html"),
          },
      output: isStandaloneBuild ? { inlineDynamicImports: true } : undefined,
    },
  },
  resolve: {
    alias: [
      {
        find: /retired-pages[/\\]am-original[/\\]source[/\\]lib[/\\](?:analytics|ab-testing)\.js$/,
        replacement: resolve(projectDirectory, "retired-pages/am-original/preview-services.js"),
      },
    ],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    watch: { ignored: ["**/retired-pages/**"] },
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react()],
});
