import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // The guard and i18n suites parse every file under src/ with the TypeScript
    // compiler, so they take seconds rather than milliseconds. That work is
    // synchronous, so a timeout cannot stop it: the test runs to the end and then
    // reports a failure anyway. Under load the old 5s default turned a slow machine
    // into six bogus failures, so give legitimate work room instead of a coin flip.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
