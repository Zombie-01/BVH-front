import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  // Only enable PWA for WEB production builds
  // Disable for: development, Capacitor/native builds (Android/iOS)
  const isWebBuild = !process.env.CAPACITOR_PLATFORM;
  const isPWAEnabled =
    isWebBuild && mode === "production" && command === "build";

  console.log(
    `[Vite Config] mode=${mode}, command=${command}, isWebBuild=${isWebBuild}, isPWAEnabled=${isPWAEnabled}`,
  );

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      // PWA only in production web builds - NOT in dev or native (Android/iOS) builds
      isPWAEnabled &&
        VitePWA({
          registerType: "autoUpdate",
          injectRegister: "auto",
          includeAssets: ["favicon.svg", "robots.txt", "apple-touch-icon.png"],
          manifest: {
            name: "Барилгын Үйлчилгээний Хүргэлт",
            short_name: "Үйлчилгээний Хүргэлт",
            description:
              "Барилгын материал, хүргэлт, мэргэжлийн үйлчилгээг нэг дороос олоорой.",
            theme_color: "#f97316",
            icons: [
              { src: "pwa-192.png", sizes: "192x192", type: "image/png" },
              { src: "pwa-512.png", sizes: "512x512", type: "image/png" },
            ],
          },
          workbox: {
            // Ensure navigation requests fall back to index.html (SPA)
            navigateFallback: `${process.env.BASE_URL || "/"}index.html`,
            navigateFallbackDenylist: [
              /^\/api\//,
              /^\/storage\//,
              /\/_next\//,
              /\.(?:png|jpg|jpeg|svg|webp|gif|map)$/,
            ],
            runtimeCaching: [
              {
                // Supabase storage (public/private) — prefer network, fallback to cache
                urlPattern:
                  /^https?:\/\/[A-Za-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/.*$/,
                handler: "NetworkFirst",
                options: {
                  cacheName: "supabase-storage",
                  expiration: {
                    maxEntries: 200,
                    maxAgeSeconds: 60 * 60 * 24 * 7,
                  },
                },
              },
              {
                // CDN-hosted images / avatars
                urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/,
                handler: "StaleWhileRevalidate",
                options: {
                  cacheName: "images",
                  expiration: { maxEntries: 300 },
                },
              },
            ],
          },
        }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
