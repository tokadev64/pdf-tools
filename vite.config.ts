import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/pdf-tools/",
  plugins: [vue()],
  build: {
    outDir: "dist",
  },
});
