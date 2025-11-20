import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import path from "path";
import {
  ignoreModuleImportPlugin,
  viteWorkerPlugin
} from "xml-xsd-validator-browser";
import fs from "fs";

// --- PLUGIN ROLLUP YANG FIX IMPORT TANPA EKSTENSI DI NODE_MODULES ---
function rollupFixMissingJsExtension() {
  return {
    name: "rollup-fix-missing-js-extension",
    resolveId(source, importer) {
      // hanya fix import dari library kamu
      if (
        importer &&
        importer.includes("node_modules/xml-xsd-validator-browser") &&
        source.startsWith("./") &&
        !source.endsWith(".js")
      ) {
        const corrected = source + ".js";

        const importerDir = path.dirname(importer);
        const filePath = path.resolve(importerDir, corrected);

        if (fs.existsSync(filePath)) {
          // kalau file ada → paksa rollup pakai versi yang benar
          return corrected;
        }
      }

      return null;
    },
  };
}

export default defineConfig({
  plugins: [
    vue(),
    viteWorkerPlugin(),
    ignoreModuleImportPlugin(),
    dts({
      insertTypesEntry: true,
      include: ["src"],
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  build: {
    lib: {
      entry: "src/index.ts",
      name: "MyVueLib",
      fileName: "my-vue-lib",
      formats: ["es", "umd"],
    },
    rollupOptions: {
      external: ["vue"],
      plugins: [
        rollupFixMissingJsExtension(), // ⬅ FIX INTI DI SINI
      ],
      output: {
        globals: { vue: "Vue" },
      },
    },
  },
});
