import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {
    sortTailwindcss: {
      stylesheet: "./src/style.css",
    },
  },
  pack: {
    dts: {
      generator: "tsgo",
    },
    exports: true,
  },
});
