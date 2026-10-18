import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import TailwindLegacyPlugin from "vite-plugin-tailwind-legacy";
import { defineConfig, lazyPlugins } from "vite-plus";

export default defineConfig({
  build: {
    // js 兼容图书馆的烂电脑
    target: ["es2020", "chrome90"],
  },
  plugins: lazyPlugins(() => [
    react(),
    tailwindcss(),
    TailwindLegacyPlugin(), // css 兼容图书馆的烂电脑
  ]),
  server: {
    proxy: {
      "/api/user": {
        target: "http://localhost:11400",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/user/, "/api"),
      },
    },
  },
});
