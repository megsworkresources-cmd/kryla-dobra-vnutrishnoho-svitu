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
import { assertNoServiceRoleClientImports } from "./scripts/no-service-role-client-guard.mjs";
import { clientOutputDirectory, finalizePwa } from "./scripts/pwa-build";
import { pwaWorkboxOptions } from "./scripts/pwa-workbox";
import { writeDeployVersion } from "./scripts/deploy-version";

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
      {
        // The generated service-role client bypasses RLS; no app code may import it.
        name: "no-service-role-supabase-client",
        apply: "build",
        buildStart() {
          assertNoServiceRoleClientImports();
        },
      },
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
        integration: {
          configureOptions(config, options) {
            // Generation, precache scanning and verification must share the deployed directory.
            const clientOutput = clientOutputDirectory(config);
            options.outDir = clientOutput;
            options.workbox = { ...options.workbox, globDirectory: clientOutput };
          },
        },
        workbox: pwaWorkboxOptions(),
      }),
      finalizePwa(),
      // After the service worker, so the version file is never precached as an old build.
      writeDeployVersion(),
    ],
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
