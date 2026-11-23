# Experience audit — tranche 2 (2026-11-21)

## Matrix (browser-verified, Chromium/Playwright, local preview)
33 routes × 4 viewports (320×568, 393×852, 820×1180, 1280×900) × UA/EN = 264 page loads.
Checked: horizontal overflow, page errors, clipped text, unnamed buttons/links, exactly one main, controls under 40px.
Routes: / /world /explore /games /watch /story /garden /community-garden /settings /resources /privacy /caregiver-login /helper /friends /safe /forest /meadow /sky /clouds /path /studio /bedtime /stroll /puddles /maze /count /safe-drawing /together /dreams /wonders /raindrop /trails /island.

## Defects found and fixed
1. English mode showed the five adventure titles, Back/Next labels and adventure copy in Ukrainian on routes that used the main translator (the extra dictionary was only read by practice screens). Fixed centrally in `tr()`; regression test `src/test/i18n-extras.test.ts`.
2. Credit links on garden/community garden (24px tall) and the Settings privacy link (19px tall) were below touch-target size. Fixed in shared `GrownUpLink` and settings (44px).

Re-run after fixes: 0 findings across all 264 loads.

## Journeys (browser-verified)
All five adventures played start to finish in UA and EN at 320×568 (all spots, three chapters, closing choice, calm message, replay button visible above bottom bar), no page errors. Earlier verified flows (games, maze, counting, drawing, bedtime, stroll, puddles, breathing) unchanged in this tranche.

## Checks
- `bun run lint`: pass. `bunx vitest run`: 273 passed. Automatic build: see managed build log.

## Not verified / remaining
- Physical iPhone/Android audio, interruptions, installed offline launch: no devices.
- Per-route audio/video lifecycle trace and full media mapping list: not done in this tranche.
- Caregiver signed-in surfaces and shared-garden opt-in/opt-out not re-walked this tranche.
- Remaining films (paints, lullaby, rain, woodland) still blocked by credits.
