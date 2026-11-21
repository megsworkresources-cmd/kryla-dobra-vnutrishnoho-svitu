# Tranche 4 — playback, offline resilience and screenshot-led polish

Starting HEAD: `026a7f4bc3b335642aef3da374eaf1fdd8b171a0`. No deployment, paid generation, infrastructure/auth/database changes, or imported artwork.

## Implementation
- `src/components/StoryFilm.tsx`: invalidate pending playback on interruption, prevent stale replay, reset duration when source changes, claim exclusive video ownership, show the existing poster under reduced motion. Existing clip mappings, captions and retry retained.
- `src/components/Character.tsx`: same ownership and saved/system motion preferences, synchronous background pause, late-play cleanup.
- New `src/lib/video-focus.ts`, `src/hooks/use-media-motion.ts`: shared browser-only video ownership/preferences. New `src/hooks/use-online.ts`: event-based connectivity indicator.
- `src/routes/_caregiver/shared-garden.tsx`: Query's default offline mutation pausing could defer an adult action until reconnect. Now networkMode always, navigator guard and no retries prevent queuing. Disable sharing/withdrawal while offline; clearly distinguish local care from unconfirmed server sharing. Errors still cover connection loss despite navigator reporting online. Wrapping section header fits narrow screens.
- `src/routes/garden.tsx`: locally saved garden status offline; portrait footage no longer consumes the entire short-phone viewport, and growth words moved outside the narrow video to avoid excessive wrapping.
- `src/routes/watch.tsx`: equal-height cartoon cards, stable image dimensions, decorative play icon hidden from accessibility naming.
- `src/activities/quest.tsx`: discovery art now precedes the smaller guide so the actual interaction appears on short phones. Existing chapters/choices/progress unchanged.
- `src/lib/i18n.extras.ts`: Ukrainian-source offline messages with English entries.
- Regression coverage in `src/test/story-film.test.tsx`, new `src/test/shared-garden-offline.test.tsx`; reusable browser acceptance in `scripts/verify-tranche4.py`. Architecture rules in `AGENTS.md`; tasks in `roadmap.md`.

## Exact verification
- `bun run lint`: exit 0, no errors/warnings.
- `bunx vitest run`: exit 0, **55 files / 279 tests**. Includes exclusive video ownership, saved reduced-motion poster, pagehide preventing replay, offline no-queue/no-false-success, reconnection explicit opt-in/opt-out and unannounced offline mutation failure.
- `python3 scripts/verify-tranche4.py`: exit 0. Existing `/media/video/sunflower-story-full.mp4` genuinely played: currentTime advanced past 0.1s (recorded 0.225782s); visible Play used after initial paused state. Pause/resume passed; synthetic hidden/visible and pagehide/pageshow events paused and did not auto-resume; actual SPA navigation to World detached and paused the retained video element. System reduced motion showed poster with all videos paused.
- Browser garden test used the real signed-in UI and existing caregiver verification, but deterministic read/share response fixtures, **no live garden writes**. Online load → offline disables share and opt-out and displays unconfirmed status → reconnect performs no deferred action → explicit share/withdraw succeeded in fixture. Local garden already loaded before offline retained device storage and usable playback control. No child marker reached fixture mutation requests.
- **78 screen scenarios**: 13 requested public screens at 320×568, 393×852, 1280×1800 in UA/EN. No horizontal overflow, unnamed buttons or page errors; screenshots inspected for garden/Watch/quests/home/breathing/body/story/World. Homepage remains unchanged and face clear.
- `python3 /tmp/browser/tranche4/keyboard.py`: exit 0. Quest discoveries/Next activated by keyboard, visible focus, discovery targets ≥44px, Next scrolls fully above fixed navigation. Temporary supplemental script; primary browser acceptance remains in project.
- `bun scripts/offline-fixture.mts`: generated **5 precache entries**, all referenced files verified. `python3 scripts/verify-offline.py <fixture-root>`: exit 0, cached launch/navigation `/`, `/garden`, `/games`, uncached fallback, reconnection passed. Eight sensitive routes absent from cache and unavailable offline: `/auth/confirm`, `/caregiver-login`, `/reset-password`, `/parents`, `/shared-garden`, `/~oauth/authorize`, `/.lovable/oauth/consent`, `/api/public/mcp`.
- Managed build log latest **2026-11-21T20:24:55Z: build OK** after source changes. Manual app production builds/typechecks are prohibited by this environment; neither was run or represented as independently verified. Local `dist/client` and `.output/public` remain absent, so actual final production precache count/full installed-app offline launch cannot be inspected. Fixture results are not production-artifact proof.

Follow-up clarification: that timestamp is historical tranche-4 evidence, not a fresh typecheck result. The managed log exposes only timestamped `build OK`, not the executed command/flags, exit code or separate typecheck output. Fresh narrow browser checks and two further stale-status fixes are documented in `audit-2026-11-21-tranche3.md`; no old route audit was repeated.

## Remaining external acceptance
- Physical iPhone/Android audio, device interruptions, background/lock-screen behavior and voice quality need actual devices. Chromium events are not physical-device verification.
- Actual production worker/artifact verification and installed-app offline launch require an environment exposing the managed production output. Caregiver routes intentionally cannot cold-launch from an offline navigation cache.
- Media licenses/rights were not independently re-audited; no media generated, replaced, or imported. Longer films remain outside this tranche.