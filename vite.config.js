import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
// import monacoEditorPlugin from "vite-plugin-monaco-editor";
import monacoEditorPluginCjs from "vite-plugin-monaco-editor";
// import { viteWorkerPlugin } from "xml-xsd-validator-browser";

const monacoEditorPlugin = monacoEditorPluginCjs.default;

export default defineConfig({
  plugins: [
    vue(),
    monacoEditorPlugin({
      languages: ["xml", "html"]
    }),
    // viteWorkerPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["monaco-editor"],
  },
  worker: {
    format: 'es', // Ensures the worker is built as an ES module
    // plugins: [ /* worker-specific plugins */ ]
  },
  test: {
    environment: 'node', // ⬅️ gunakan Node environment
  },
});
