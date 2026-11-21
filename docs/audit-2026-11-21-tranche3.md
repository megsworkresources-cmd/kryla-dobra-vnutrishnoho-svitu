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
Missing media: dedicated paints/lullaby/rain/woodland full films are still short clips (historically credit-blocked). Corrected uploaded inventory: user reports **six MP4s: three Hailuo variants and three watermarked Renderforest variants**. No raw copies available in the upload mount/mirror or archive; duration/content/licensing unverified, none added. The earlier 6.6s single-clip description must not be treated as the full set. No book art/text used.

## B. Engine defect fixed
`resumeSpeaking()` after pausing device speech set state to "loading" and never left it when the browser did not fire `onresume` (Safari behaviour), leaving a false Stop control. Now resumes directly to "playing". Regression test in `src/test/phone-repairs.test.tsx`.
Confirmed in source: one speech token (new line stops the previous), stop on route change, ambient/speech/soundscape stop on hidden/pagehide, ambient restart respects saved music setting.

## C. Visual defect fixed
Shared `Btn` placed icons on their own line above the label (svg block). Now inline-flex with gap — affects every icon button (e.g. Share sunflower, Watch growth).

## D/F. Browser journeys (Chromium, local preview)
- Signed-out, UA+EN × 320×568 and 1280×900: /garden, /community-garden open; /parents and /shared-garden redirect to sign-in with safe return path; no POST requests from child garden pages.
- Signed-in test adult, 393×852 UA: Share disabled until consent checkbox; share → "Shared" + Stop; opt-out → Share again. Requests carried only `{stage, sharing}` — no name (a test child name was set locally and not sent).
- Route audit rerun (33 routes × 4 viewports × UA/EN): 0 findings.
- At the original tranche-3 commit, actual video play-then-leave and offline shared garden were not exercised. These two browser gaps are addressed in the follow-up below; physical iPhone/Android audio is still unverified.

## E. Backend project
App `.env` uses project `ftqdpebplmucvnzyltry`; `public.shared_sunflowers` and `public.ai_reports` exist there with owner RLS. Project `pahlmmtskmlrhcuevdyc` is NOT the app's configured backend — its empty schema is expected and is a mismatch to note, not an app defect. `delete_my_account()` being executable by authenticated users is intentional (self-deletion, blocks null/anonymous). Nothing changed in the database.

## Checks
`bun run lint` pass; `bunx vitest run` 54 files / 274 tests pass. Automatic build: see managed log.

## Follow-up — 2026-11-21, remaining verification/refinement only

Actual starting HEAD was **8227ec9**, whose parent is the requested **026a7f4bc3b335642aef3da374eaf1fdd8b171a0**. Preserved both commits, all prior fixes and existing pages. No deployment, backend writes, new pages, generated media or auth configuration changes.

### Confirmed defects and repairs

Two new regressions failed before the source repair (2 failed / 2 passed):
1. Reconnection briefly presented the cached “shared” status while the fresh server read was still pending.
2. A withdrawal whose response was lost still presented cached sharing as confirmed, although the server outcome was unknown.

`src/routes/_caregiver/shared-garden.tsx` now treats fetching and failed mutations as unconfirmed, in addition to offline/read errors. Explicit Refresh clears the uncertain mutation and reads current status, without sending another sharing action. Refresh is disabled during a pending mutation. Consent, growth, child storage, offline guards and no-queue semantics remain unchanged. Two focused regression tests cover pending reconnection, lost response and explicit refresh recovery.

### Actual movie playback — no codec/policy blocker in this run

Command: `python3 scripts/verify-media-garden.py` — exit **0**. The script inspects the actual accessible card/player, not a decorative character video:
- `/watch`: button “Соняшник, що шукав сонце” / “The Sunflower Who Looked for the Sun”. Visible player button “Грати” / “Play” used if initially paused.
- Asserted the playing video's exact source **`/media/video/sunflower-story-full.mp4`** and advancing currentTime (>0.1s, then another >0.08s).
- Four runs: Ukrainian/English × **393×852 and 1280×1800**. Recorded English phone currentTime **0.204041s**, Ukrainian desktop **0.210046s**, English desktop **0.250608s**; full result in temporary browser evidence.
- Clicked the actual “Мапа світу (головне меню)” / “World map (main menu)” link for SPA navigation to `/world`. Retained old video is **paused and detached**; every video remaining in the DOM is paused.
- No fake clip, codec shim, direct forced `video.play()` injection, or replacement asset. The prior synthetic visibility/pagehide checks are retained in tranche-4 acceptance, not misrepresented as physical-device interruptions.

### Authenticated offline garden and caregiver entry

The same focused command tests `/shared-garden` and `/caregiver-login` in **Ukrainian + English at 320×568 and 393×852**. No repeat all-route audit.
- Real authenticated injected adult session and real caregiver gate at localhost. Garden read/share transport is intercepted with deterministic responses: **no live opt-in/opt-out writes**. This proves UI behavior, not a fresh live persistence round-trip.
- Real `context.set_offline(True)` / `False`, also aborting garden fixture requests while offline. Consent stays checked across offline/reconnect, sharing and withdrawal are disabled offline, unconfirmed status replaces stale success.
- Reconnect automatically reads but never submits a deferred mutation. A deliberately delayed fresh read stays unconfirmed until released.
- Explicit opt-in reaches fixture, then a simulated lost withdrawal response shows retryable error/unconfirmed status. Explicit Refresh reads sharing-off without another mutation. Exactly **2 fixture mutation attempts**; none reaches Cloud. Child-local marker is absent from mutation bodies.
- Signed-out entry redirects with the shared-garden return path retained. Adult email field has the actual translated accessible label; submit is ≥44px tall. Screenshots show full consent copy, aligned icon/label, usable scroll and no horizontal overflow. Existing consent/card controls required no further visual changes.
- **0 page errors**. Screenshots and structured result: `/tmp/browser/remaining/` (temporary; not user-facing deliverables).

### Fresh read-only backend findings

Actual browser client configuration reads `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY`; safely extracted only the configured project ref: **`ftqdpebplmucvnzyltry`**. No env contents, credentials or backend URL disclosed. The differently named project from the prior request is not configured in this app; no fresh inspection of that other project was attempted.

Read-only `supabase.read_query` checks against the attached database:
- `shared_sunflowers` and `ai_reports` exist; RLS enabled on both, FORCE RLS false.
- `shared_sunflowers`: anon SELECT/INSERT/UPDATE/DELETE **false**; authenticated direct INSERT/UPDATE **false**. Owner SELECT/DELETE policies require matching auth.uid and nonanonymous account. Owner INSERT/UPDATE policies still exist but direct grants are revoked; mutations go through the existing growth RPC.
- `grow_sunflower`, `read_shared_sunflowers`, `delete_my_account`: authenticated EXECUTE true, anon false. Old `publish_sunflower`: authenticated/anon EXECUTE false. Public stage projection EXECUTE true for anon/authenticated; it exposes only opted-in coarse stage rows.
- `ai_reports`: broad table grants (including anon) remain, but its **only** RLS policy is authenticated owner INSERT. No anon policy; SELECT/UPDATE/DELETE are policy-denied. This is not evidence of current anonymous exposure; unnecessary grants are a hardening consideration, **not changed** under the no-writes instruction.
- No table contents/child records read, no migrations or destructive operations. This verifies metadata/policy/grant configuration, not two-account live isolation.

### Checks and exact managed-build limitations

- `bun run lint` → `$ eslint .`, exit **0**, no warnings/errors.
- `bunx vitest run` → **55 test files passed / 281 tests passed**, exit **0**. The two added tests previously reproduced the defects before repair.
- `python3 scripts/verify-media-garden.py` → exit **0**, four real movie play/exit scenarios, four signed-out entry and four authenticated offline garden scenarios; zero page errors.
- Available managed evidence is `/tmp/observability/build-errors.log`; it was initially absent after sandbox resumption, then the harness recreated it after edits with timestamped `build OK` entries (including **2026-11-21T20:36:53Z**). This is managed build status, **not proof of a separate production build or independent typecheck**.
- Exact executed managed build command, flags, exit code and typecheck output are **not exposed** by that log. `/tmp/observability/typecheck-errors.log` is absent. No available tool retrieves those missing details; manual app build/typecheck commands are prohibited in this environment, so none was run.
- Repository CI is configured with `bunx tsc --noEmit` and `bun run build`; these are **configured commands only**, not executed/verified CI outcomes in this turn. Package scripts resolve build to `vite build` and build:dev to `vite build --mode development`. The formerly supplied preview-error command is not assumed to be today's command.
- Actual production output and production precache/installed-app offline launch remain unverified. Chromium offline UI tests and the prior generated-worker fixture do not establish production offline launch. Physical iPhone/Android sound, real lock-screen/interruption behavior, sign-up email delivery and recovery remain device/service-dependent acceptance items.

Final rerun after the Refresh safeguard: `bun run lint` exit 0; `bunx vitest run` exit 0, 55 files / 281 tests (start 20:40:47 UTC); `PYTHONDONTWRITEBYTECODE=1 python3 scripts/verify-media-garden.py` exit 0, same 12 focused scenarios, zero page errors. Managed log at that check: **2026-11-21T20:40:14Z: build OK**, with no separate typecheck record. Subsequent harness changes only prevent bytecode artifacts and capture safe media-state diagnostics on a failed playback check.

Queued-work resolution: `get_tasks {}` reports **no unfinished tasks**, and saved verification commit **47dc424** exists after 8227ec9. No hanging worker to resume/cancel and no paid operation/credit failure this turn. Completed accessible bilingual resource and asset review; report `resources-assets-review-2026-11-21.md`. Six reported MP4 bytes absent; no watermark-removal or unlicensed integration. Managed-check command/output limitations above still apply; current managed build status is checked after edits, never substituted for a standalone typecheck.

Final queued-pass checks (20:50 UTC): lint exit 0; full vitest exit 0, **56 files / 296 tests**; focused media/garden acceptance exit 0, 12 scenarios/no page errors; resource browser check exit 0, six UK/EN viewport scenarios. Managed log **2026-11-21T20:50:01Z: build OK**; exact managed command/typecheck result still unavailable. Existing privacy and caregiver logic preserved; no Cloud writes or deployment.
