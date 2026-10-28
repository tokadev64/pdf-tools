import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite-plus";

export default defineConfig({
  base: "/pdf-tools/",
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  plugins: [vue()],
  build: {
    outDir: "dist/pdf-tools",
  },
  fmt: {
    printWidth: 100,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: false,
    sortImports: true,
    ignorePatterns: [
      "dist/**",
      "node_modules/**",
      "**/*.md",
      "**/*.yml",
      "**/*.yaml",
      "**/*.toml",
      "**/*.html",
      "**/*.svg",
    ],
  },
  lint: {
    ignorePatterns: ["dist/**", "node_modules/**"],
    env: {
      browser: true,
      node: true,
    },
    categories: {
      correctness: "error",
      suspicious: "error",
    },
    plugins: ["eslint", "typescript", "import", "unicorn", "oxc", "vue"],
  },
});
