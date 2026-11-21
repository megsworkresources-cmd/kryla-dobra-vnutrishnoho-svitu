# Tranche 3 — media lifecycle and caregiver/garden safety (2026-11-21)

## A. Media inventory (from source; every asset URL returned HTTP 206 locally)
| Route / surface | Trigger | Source | Status |
|---|---|---|---|
| All routes | first touch/click/Enter | `src/lib/audio.ts` ambient: quiet-bandura/lullaby/sopilka/tsymbaly.mp3 (recorded instrumentals, CDN) | present; gated on sound+music+volume, stops when hidden/pagehide |
| All routes | taps, page change | synthesized `sfx()` in `audio.ts` | present (no files) |
| Characters (CharacterSay, Narration) | auto line after unlock / listen button | `src/lib/speak.ts`: natural voice via `voice.server.ts` (signed-in adult only) else device speech, UA/EN by setting | present; device-speech quality varies by device |
| Character portraits | CharacterSay | character-{solomiya,taras,olenka,marko,daryna,lihtaryk}.mp4 via `character-media.ts` | present (silent loops) |
| /watch cartoons | card → player | sunflower, hedgehog(lantern), kite, bridge, paints, lullaby(goodnight) via `STORY_MEDIA` | all 6 mapped |
| /sky/$id stories | story player | lantern, bridge→woodland-bridge, seed→sunflower, rain, sleep→goodnight; `reflect`/`sounds` intentionally have no film | all mapped |
| /garden, /community-garden, /shared-garden | Watch growth | recorded-sunflower-growth.mp4 (Naturenow, CC BY-SA 4.0, credited) | present |
| /sky sounds, activities | soundscape choice | synthesized rain/wind/crickets in `audio.ts` | present; stops on route change |
| Quests, games, breathing | chimes/notes | synthesized | present |

Orphaned assets (unreferenced, kept, not deleted): bridge-friends.mp4, kite-breeze.mp4, lantern-friends.mp4, sunflower-field.mp4.
Missing media: dedicated paints/lullaby/rain/woodland full films are still short clips (credit-blocked). The user's 6.6 s Hailuo "shadow-to-bloom" storyboard is NOT in the repo; not added. No book art/text used.

## B. Engine defect fixed
`resumeSpeaking()` after pausing device speech set state to "loading" and never left it when the browser did not fire `onresume` (Safari behaviour), leaving a false Stop control. Now resumes directly to "playing". Regression test in `src/test/phone-repairs.test.tsx`.
Confirmed in source: one speech token (new line stops the previous), stop on route change, ambient/speech/soundscape stop on hidden/pagehide, ambient restart respects saved music setting.

## C. Visual defect fixed
Shared `Btn` placed icons on their own line above the label (svg block). Now inline-flex with gap — affects every icon button (e.g. Share sunflower, Watch growth).

## D/F. Browser journeys (Chromium, local preview)
- Signed-out, UA+EN × 320×568 and 1280×900: /garden, /community-garden open; /parents and /shared-garden redirect to sign-in with safe return path; no POST requests from child garden pages.
- Signed-in test adult, 393×852 UA: Share disabled until consent checkbox; share → "Shared" + Stop; opt-out → Share again. Requests carried only `{stage, sharing}` — no name (a test child name was set locally and not sent).
- Route audit rerun (33 routes × 4 viewports × UA/EN): 0 findings.
- Not exercised: actual video play-then-leave (my scripted click did not start a clip — unverified), offline shared garden state, physical iPhone/Android audio.

## E. Backend project
App `.env` uses project `ftqdpebplmucvnzyltry`; `public.shared_sunflowers` and `public.ai_reports` exist there with owner RLS. Project `pahlmmtskmlrhcuevdyc` is NOT the app's configured backend — its empty schema is expected and is a mismatch to note, not an app defect. `delete_my_account()` being executable by authenticated users is intentional (self-deletion, blocks null/anonymous). Nothing changed in the database.

## Checks
`bun run lint` pass; `bunx vitest run` 54 files / 274 tests pass. Automatic build: see managed log.
