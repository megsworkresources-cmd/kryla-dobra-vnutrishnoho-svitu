# Homepage repair and verification — 21 November 2026

## Starting version and scope

The actual saved HEAD was `2e79a0ac9aec57451df3e0a66733439e466a8955`, a descendant of requested `5c13a1a364b208bb1c2c2af0c4b9a4498f16bc7d`. Retained the already-saved stabilization work; did not reset or switch history.

Only homepage layout changed. The illustrated opening now reserves enough vertical space for the girl's face on short phones. Narrow-screen heading sizes prevent the title/subtitle from falling over her eyes. The description and existing links stay lower and scroll into view above the fixed navigation. No features, auth, infrastructure, secrets, database or deployment changes.

## Fresh checks

| Command / check | Result |
| --- | --- |
| `bun run lint` | Exit 0; no errors or warnings |
| `bunx vitest run` | Exit 0; 50 test files, 258 tests passed |
| Automatic local build/typecheck log | Latest entry at 18:07:39 UTC: `build OK`; no standalone typecheck invoked |
| `lovable build status --json` | Saved starting HEAD's hosted preview build succeeded at 18:06:49 UTC; this is a preview build, not an independent production build of the subsequent homepage edit |
| `lovable build diagnostics br_5048c80f-a285-5f43-be57-0b90496936ef --json` | Empty diagnostics and failed-target lists |
| `python3 /tmp/browser/home/verify_home.py` | Eight fresh public UI scenarios passed: UA/EN at 320×568, 375×667, 393×852, 1280×1800; no horizontal overflow or page errors; adult link clear of fixed navigation; entry link reaches `/world` |

Screenshots were inspected before and after the fix, including the short 320×568 viewport where the original description box covered the girl's face. Browser evidence is desktop Chromium at phone sizes, not a physical iPhone or Android test.

## Offline browser check and exact count

Commands executed:

```sh
bun scripts/offline-fixture.mts > /tmp/home-offline-fixture.json
cp scripts/verify-offline.py /tmp/browser/offline/check_offline.py
ROOT=$(python3 -c 'import json; print(json.load(open("/tmp/home-offline-fixture.json"))["root"])')
python3 /tmp/browser/offline/check_offline.py "$ROOT"
```

The generated Workbox **fixture** had exactly **5 precache entries**, all successfully read from disk: `assets/app.js`, `assets/app.css`, `icon-192.png`, `offline.html`, `manifest.webmanifest`. Generation reported no warnings. The fixture uses the exact shared Workbox configuration consumed by `vite.config.ts`; its HTML pages and JS/CSS are test fixtures, not built app routes/chunks.

A separate localhost-origin service worker was installed without registering any worker on the Lovable preview. Both browser offline mode and server connection shutdown were used, because Chromium's offline flag alone did not block worker-owned network requests.

- Fresh document launch and cached navigation passed for `/`, `/garden`, `/games`.
- `/never-visited` returned the app's bilingual prepared offline page.
- Cache inspection found none of these sensitive routes; all failed rather than serving cached content while offline: `/auth/confirm`, `/caregiver-login`, `/reset-password`, `/parents`, `/shared-garden`, `/~oauth/authorize`, `/.lovable/oauth/consent`, `/api/public/mcp`.
- Reconnection and navigation passed.

This validates generated-worker policy behavior, **not the actual production app's offline hydration, chunks, installed launch or media playback**.

## Exact production-verification limitation

- The sandbox workflow disallows manually running the app's production builds and standalone typechecks; it delegates app build/typecheck execution to managed automatic checks. Vite and the generator are installed, so this is an execution-workflow restriction, not a missing-tool claim.
- Neither `dist/client` nor `.output/public` exists in the accessible sandbox. There is no local final `dist/client/sw.js` to inspect. A fresh independent production build was **not performed**.
- The CLI exposes managed preview status/diagnostics, not a standalone production-build command.
- A public probe of hosted preview `/sw.js` returned **HTTP 401**, `text/plain; charset=UTF-8`, and no `precacheAndRoute` manifest. Therefore hosted output cannot substitute for a local final-worker inspection here. No authentication or visibility settings were changed to bypass this restriction.
- The actual final production precache count and existence of every production asset remain **unverified**. The five-entry fixture count must not be presented as the app's production count.
- Physical iPhone/Android devices and a complete rights-holder/license audit are not available. No physical-device or media-rights acceptance claim is made.

Nothing was deployed.