import type { VitePWAOptions } from "vite-plugin-pwa";
import { canCacheNavigation } from "../src/lib/pwa-policy";

/** The production worker and standalone acceptance harness use identical caching behavior. */
export function pwaWorkboxOptions(): NonNullable<VitePWAOptions["workbox"]> {
  return {
    globPatterns: [
      "**/*.{js,css,png,jpg,jpeg,webp,svg,woff2,mp3}",
      "offline.html",
      "manifest.webmanifest",
    ],
    maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
    navigateFallback: null,
    cleanupOutdatedCaches: true,
    runtimeCaching: [
      {
        urlPattern: canCacheNavigation,
        handler: "NetworkFirst",
        options: {
          cacheName: "pages",
          networkTimeoutSeconds: 4,
          expiration: { maxEntries: 60 },
          precacheFallback: { fallbackURL: "/offline.html" },
        },
      },
      {
        urlPattern: ({ url, sameOrigin }) =>
          sameOrigin &&
          (url.pathname.startsWith("/__l5e/assets-v1/") ||
            url.pathname.startsWith("/assets/") ||
            url.pathname.startsWith("/audio/") ||
            url.pathname.startsWith("/media/")),
        handler: "CacheFirst",
        options: {
          cacheName: "media",
          expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 },
          rangeRequests: true,
          cacheableResponse: { statuses: [0, 200] },
        },
      },
    ],
  };
}
