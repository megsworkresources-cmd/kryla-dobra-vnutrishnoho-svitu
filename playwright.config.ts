import { defineConfig, devices } from "@playwright/test";

/**
 * Real-WebKit smoke test for the recorded films.
 *
 * Every Safari-specific video bug in this project was found in jsdom first and had to be
 * diagnosed blind: jsdom has no media pipeline, so `play()`, `currentTime`, `playsInline`
 * and WebKit's autoplay refusal cannot be observed there. These tests run the app in
 * Playwright's WebKit at an iPhone viewport and check the film actually moves.
 *
 *   bunx playwright install --with-deps webkit
 *   bun run test:e2e
 *   E2E_BASE_URL=http://127.0.0.1:3000 bun run test:e2e   # use a running server
 */
const baseURL = process.env["E2E_BASE_URL"] ?? "http://127.0.0.1:5199";
const isCi = Boolean(process.env["CI"]);
// An already-running server (local or deployed) needs no webServer entry.
const webServer = process.env["E2E_BASE_URL"]
  ? []
  : [
      {
        command: "bun run dev --host 0.0.0.0 --port 5199",
        url: baseURL,
        reuseExistingServer: !isCi,
        timeout: 120_000,
      },
    ];

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 20_000 },
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 1 : 0,
  // The GitHub reporter turns a failed assertion into a check annotation, so a CI run
  // says which line of which film broke instead of only that the job went red.
  reporter: isCi ? [["github"], ["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    // The films are deliberately withheld from reduced-motion users; the smoke test
    // must exercise the moving picture, so ask for the ordinary preference.
    reducedMotion: "no-preference",
    trace: "retain-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "iPhone WebKit",
      use: { ...devices["iPhone 14"], browserName: "webkit" },
    },
  ],
  webServer,
});
