import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import TailwindLegacyPlugin from "vite-plugin-tailwind-legacy";
import { defineConfig, lazyPlugins } from "vite-plus";

function randomString(length: number) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default defineConfig({
  build: {
    // js 兼容图书馆的烂电脑
    target: ["es2020", "chrome90"],
  },
  plugins: lazyPlugins(() => [
    react(),
    tailwindcss(),
    TailwindLegacyPlugin({
      // css 兼容图书馆的烂电脑
      assetsDir: "dist/assets",
      publicPath: "/",
      outputCSSName: `legacy-${randomString(8)}.css`,
    }),
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
