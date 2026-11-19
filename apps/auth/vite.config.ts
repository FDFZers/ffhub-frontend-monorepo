import tailwindcss from "@tailwindcss/vite";
import legacy from "@vitejs/plugin-legacy";
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
    target: ["es2020", "chrome90", "firefox88"],
  },
  plugins: lazyPlugins(() => [
    react(),
    tailwindcss(),
    legacy({
      // js 兼容图书馆的烂电脑
      targets: ["Chrome >= 90", "Firefox >= 88"],
    }),
    TailwindLegacyPlugin({
      // css 兼容图书馆的烂电脑
      assetsDir: "dist/assets",
      publicPath: "/assets/",
      outputCSSName: `legacy-${randomString(8)}.css`,
    }),
  ]),
  server: {
    proxy: {
      "/api/student_id": {
        target: "http://localhost:11400",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/student_id/, "/api"),
      },
    },
  },
});
