import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import { codeInspectorPlugin } from "code-inspector-plugin";
import { resolve } from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

let devProxyServer = "http://localhost:8081";
if (process.env.DEV_PROXY_SERVER && process.env.DEV_PROXY_SERVER.length > 0) {
  console.log("Use devProxyServer from environment: ", process.env.DEV_PROXY_SERVER);
  devProxyServer = process.env.DEV_PROXY_SERVER;
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ["defaults", "not IE 11"],
    }),
    codeInspectorPlugin({
      bundler: "vite",
    }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["logo.webp", "apple-touch-icon.png"],
      manifest: {
        name: "Memos - 快速记录你的想法",
        short_name: "Memos",
        description: "一个隐私优先的轻量级笔记服务",
        theme_color: "#f4f4f5",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        runtimeCaching: [
          {
            urlPattern:
              /\/memos\.api\.v1\.(WorkspaceService|WorkspaceSettingService|AuthService|UserService)\/(GetWorkspaceProfile|GetWorkspaceSetting|GetAuthStatus|GetUserSetting)/,
            handler: "StaleWhileRevalidate",
            method: "POST",
            options: {
              cacheName: "config-api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7天，配置类数据变化较少
              },
              // 使用插件来自定义缓存键，包含请求体内容以区分不同的设置请求
              plugins: [
                {
                  cacheKeyWillBeUsed: async ({ request }) => {
                    const url = request.url;
                    if (request.method === "POST" && request.body) {
                      try {
                        // 读取请求体内容并生成哈希
                        const bodyBuffer = await request.arrayBuffer();
                        const bodyHash = Array.from(new Uint8Array(bodyBuffer))
                          .map((b) => b.toString(16).padStart(2, "0"))
                          .join("");
                        return `${url}#${bodyHash}`;
                      } catch (e) {
                        console.warn("Failed to hash request body:", e);
                        return url;
                      }
                    }
                    return url;
                  },
                },
              ],
            },
          },
          {
            urlPattern: /\/memos\.api\.v1\./,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24小时
              },
            },
          },

          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30天
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 3001,
    proxy: {
      "^/api": {
        target: devProxyServer,
        xfwd: true,
        secure: false,
      },
      "^/memos.api.v1": {
        target: devProxyServer,
        xfwd: true,
        secure: false,
      },
      "^/file": {
        target: devProxyServer,
        xfwd: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      "@/": `${resolve(__dirname, "src")}/`,
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/app.[hash].js",
        chunkFileNames: "assets/[name].[hash].js",
        assetFileNames: "assets/[name].[hash][extname]",
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "mui-vendor": ["@mui/joy", "@emotion/react", "@emotion/styled"],
          "utils-vendor": ["dayjs", "lodash-es", "mobx", "mobx-react-lite"],
          "katex-vendor": ["katex"],
          "highlight-vendor": ["highlight.js"],
          "mermaid-vendor": ["mermaid"],
          "leaflet-vendor": ["leaflet", "react-leaflet"],
        },
      },
    },
  },
});
