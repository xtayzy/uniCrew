import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import process from "node:process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    modules: {
      // Отключаем минификацию названий CSS классов
      localsConvention: "camelCase",
      generateScopedName: "[name]__[local]___[hash:base64:5]",
    },
  },
  build: {
    cssCodeSplit: false,
    minify: process.env.NODE_ENV === "production", // Минификация только в production
    sourcemap: false, // Отключаем source maps для избежания проблем с CSP
    rollupOptions: {
      output: {
        // Отключаем минификацию CSS классов в production
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "assets/[name].[ext]";
          }
          return "assets/[name]-[hash].[ext]";
        },
        // Настройки для минификации без использования eval
        format: 'es',
        manualChunks: undefined,
      },
    },
    // Отключаем использование eval в production
    target: 'esnext',
    esbuild: {
      legalComments: 'none',
    },
  },
});
