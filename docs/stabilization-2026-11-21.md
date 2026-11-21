# Existing-app stabilization — 21 November 2026

## Scope and status

Followed the priority change: the unfinished My Quiet Place/First–Then integration was removed, including its routes, controls, preferences, translations and tests. It is deferred to a separate phase. Existing public addresses, content, characters and local child data were preserved. No publishing, domains, secrets, authentication configuration, database mutations or destructive schema changes were performed.

**This is a verified repair delivery, not a claim that the entire stabilization/device acceptance pass is complete.** Production offline behavior and real-phone listening remain outstanding.

## Confirmed repairs

- Ambient stop now synchronously cancels pending recording callbacks and stops the old source; switching pages cannot start a late decoded recording during the former 320 ms stop delay.
- Nature sources stop before another nature selection starts and are cleared when their shared audio context closes or is destroyed.
- Device speech handles real pause/resume events. A natural-voice failure received while paused retains a device-speech fallback for an explicit resume; stopping clears that fallback.
- Changes to the existing effects-volume preference synchronize the shared audio engine immediately.
- All remaining non-null list assertions in app-owned routes, activities, components and content were removed. Counting has a playable original fallback for empty rounds; bedtime reaches its existing discussion panel without accessing a missing beat; story variants handle non-finite counters; cartoon/world lists use deterministic bounded indices; missing character replies/place images retain existing comfort/illustration content; practice vision ignores missing answers/icons.
- Maze/counting rules were moved into browser-safe content helpers rather than exported alongside route components, resolving their Fast Refresh warnings.
- App-owned formatting failures were repaired. The generated server client joins the already-excluded generated clients in lint configuration; it was not edited.

## PWA repair and limitation

Source inspection confirmed the lifecycle mismatch: VitePWA's client `closeBundle` runs before Nitro copies the built client files into `.output/public`. Scanning that destination at the earlier hook can miss the application bundle.

The integration now scans the **resolved actual client output** for generation, keeps `/sw.js` in the existing deployable destination, then regenerates and checks it after final asset copying. The production verification hook fails if the worker lacks JavaScript, CSS, the offline fallback or the install icon, or references files absent from the final output. HTML navigation remains NetworkFirst; existing media remains CacheFirst. Existing local recordings are included in the asset patterns. No handwritten service worker was introduced.

A bilingual offline page is precached for previously unopened pages. Account, caregiver, password, OAuth and API navigations are excluded from runtime caching. The existing preview/dev registration guards are unchanged.

**Not yet verified:** actual production precache count and installed-app offline launch/navigation. Production output folders are not exposed in this sandbox, and a separate manual production build was not run. The automatic build/typecheck signal was OK, but that is not an offline browser test. A read-only request to the currently published `/sw.js` returned 404; the live app was not changed. The generated worker and visited/unvisited route fallbacks must be exercised using the final production output before declaring offline acceptance complete.

## Database evidence — read-only

Live catalog queries confirmed:

- `shared_sunflowers` has RLS enabled.
- Anonymous SELECT/INSERT/UPDATE/DELETE table privileges are all false.
- Authenticated direct INSERT/UPDATE privileges are false; owner DELETE is granted and constrained by the non-anonymous owner policy.
- `grow_sunflower` is authenticated-only, checks caller identity, bounds stages to 0–5, caps initial growth at 1 and later increases at one stage per the existing 20-hour interval.
- The older unrestricted publishing RPC is executable by neither anonymous nor authenticated callers.
- Public community reads expose only opted-in coarse stages, capped at 100, through `read_public_sunflower_stages`.
- The caregiver shared-garden projection checks authentication and returns only opted-in flower IDs/stages.

No new grants/policies were needed, so none were applied. These are live permission/definition checks, not newly minted multi-account browser isolation tests.

## Exact verification results

- Complete Vitest run: **48 files, 252 tests passed**, approximately 40 seconds.
- Final targeted localization/PWA rerun: **2 files, 6 tests passed**.
- Full lint: **0 errors, 0 warnings**.
- Latest observed automatic build/typecheck entry: **build OK**, 17:33:41 UTC. No separate manual production-build or typecheck command was run.
- `git diff --check`: clean before final documentation changes.
- Browser checks on 14 existing public routes at **320 × 852** and **393 × 852**: no horizontal overflow and no page errors. Routes: World, count, maze, bedtime, stroll, puddles, Together, story, Watch, garden, settings, resources, safe drawing and games.
- Counting completes all four rounds and exposes replay at both phone widths; bedtime reaches its discussion prompts; a failed/signed-out story request displays the clearly labelled app-written fallback.
- English World/maze and the bottom navigation were screenshot-reviewed. Garden was also captured at desktop size.

Regression additions cover empty maze/counting data, invalid story counters, missing place/character lists, invalid cartoon indices, synchronous recording cancellation, source replacement/teardown, device-speech events, empty/icon-only precache rejection and self-contained Workbox serialization/account-cache exclusion.

## Media inventory and remaining work

Existing Watch mappings already reference paintings, lullaby and rain clips; the separate woodland bridge clip is used by the sky-story mapping. All six character-loop pointers are present. These are **existing clips**, not newly completed longer films. The requested longer paints/lullaby/rain/woodland films and their conditional World bubbles were not generated in this pass. No new copyrighted media, placeholders or fabricated playback results were added.

Remaining acceptance work:

1. Inspect the actual final worker and record its precache count; test warmed offline launch, cached-route navigation, uncached-page fallback, local game/story behavior and account-route non-caching.
2. Listen on a physical iPhone and Android: initial gestures, silent-switch behavior, lock/unlock, calls/background interruptions, explicit resume/stop, volume and speaker quality. Chromium-sized browser checks do not establish Safari audio reliability.
3. Play each existing recorded clip through loading, interruption, replay and failure states on real devices; verify recorded-media rights/provenance where documentation is incomplete.
4. Complete exhaustive game, maze-touch, drawing-touch, accessibility and caregiver end-to-end acceptance. Existing regression tests cover many of these, but this browser walk did not exercise every control.
5. Resolve longer-film generation and any remaining unverified external-resource facts without inventing media, contacts or rights.

## Exact changed files

Production/source:

- `AGENTS.md`
- `eslint.config.js`
- `roadmap.md`
- `vite.config.ts`
- `public/offline.html`
- `scripts/pwa-build.ts`
- `src/content/list.ts`
- `src/content/play.ts`
- `src/content/adventures.i18n.ts` — formatting only
- `src/content/play.i18n.ts` — formatting and reuse of the original fallback round
- `src/content/resources.i18n.ts` — formatting only
- `src/content/characters.ts`
- `src/content/places.ts`
- `src/content/story-builder.ts`
- `src/components/CartoonStage.tsx`
- `src/components/Practice.tsx`
- `src/lib/audio.ts`
- `src/lib/speak.ts`
- `src/lib/pwa-policy.ts`
- `src/lib/i18n.ts` — formatting only
- `src/routes/__root.tsx`
- `src/routes/bedtime.tsx`
- `src/routes/count.tsx`
- `src/routes/maze.tsx`
- `src/routes/world.tsx`
- `src/routes/puddles.tsx` — formatting only
- `src/routes/stroll.tsx` — formatting only
- `src/routes/together.tsx` — formatting only

Tests/documentation:

- `src/test/audio-mix.test.tsx`
- `src/test/phone-repairs.test.tsx`
- `src/test/play.test.ts`
- `src/test/pwa-build.test.ts`
- `src/test/story-builder.test.ts`
- `src/test/content-fallbacks.test.tsx`
- `docs/stabilization-2026-11-21.md`