// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";
import { loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// The framework's dev asset proxy serves recorded films and images from Lovable,
// but it reads LOVABLE_PREVIEW_HOST from process.env. Vite only exposes VITE_*
// variables itself, so forward the host in .env (or a .env.local override) and
// never replace the value Lovable's own sandbox already provides.
const localEnv = loadEnv(process.env["NODE_ENV"] ?? "development", process.cwd(), "");
if (!process.env["LOVABLE_PREVIEW_HOST"] && localEnv["LOVABLE_PREVIEW_HOST"])
  process.env["LOVABLE_PREVIEW_HOST"] = localEnv["LOVABLE_PREVIEW_HOST"];

export default defineConfig({
  vite: {
    plugins: [
      mcpPlugin({
        path: "/api/public/mcp",
        metadataPath: "/api/public/.well-known/oauth-protected-resource",
      }),
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: null,
        devOptions: { enabled: false },
        manifest: false,
        filename: "sw.js",
        // TanStack Start emits the deployable client bundle to .output/public.
        // Keeping Workbox on dist/client creates an empty, unused service worker.
        outDir: ".output/public",
        workbox: {
          globPatterns: ["**/*.{js,css,png,jpg,jpeg,webp,svg,woff2}"],
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          navigateFallback: null,
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: ({ request, url }) =>
                request.mode === "navigate" &&
                !url.pathname.startsWith("/~oauth") &&
                !url.pathname.startsWith("/api/"),
              handler: "NetworkFirst",
              options: {
                cacheName: "pages",
                networkTimeoutSeconds: 4,
                expiration: { maxEntries: 60 },
              },
            },
            {
              urlPattern: ({ url, sameOrigin }) =>
                sameOrigin &&
                (url.pathname.startsWith("/__l5e/assets-v1/") ||
                  url.pathname.startsWith("/assets/") ||
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
        },
      }),
    ],
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
