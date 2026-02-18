import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "maskable-icon-512x512.png",
      ],

      manifest: {
        name: "LADYB RESIN ART Gallery",
        short_name: "LADYB Resin",
        description: "Shop beautiful resin art products",
        theme_color: "#111111",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",

        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },

          /* ✅ Maskable icon (Android adaptive icon support) */
          {
            src: "/maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
