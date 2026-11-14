# Full app audit: findings only (no fixes yet)

## What I could and couldn't check
- **Live preview logs:** none are available this turn. The browser error, console and network log files don't exist, so I did **not** look at live console or network traffic for this audit.
- **What I did instead:** read the code across every page and part listed below, and searched for unsafe typing, ignored errors, timers and listeners.
- **Earlier tests in this conversation (not re-run now):** 99 automated tests passed, plus browser checks at 320px, 390px and desktop width.
- **Not checked at all:** a physical iPhone (Safari autoplay, phone-call and lock-screen interruptions, how the audio actually sounds), real email delivery, and outside agent (MCP) clients.

## Coverage list
- **Pages:** home (index), world, explore, friends, garden, games, watch, story, helper, safe, settings, caregiver-login, reset-password, the OAuth consent page; forest, meadow, path, sky, studio and clouds (each place's list page and its exercise pages); caregiver pages (parents, shared-garden, and the gate around them); the public MCP endpoint.
- **Shared parts:** Activity, BottomNav, Character, Face, Hub, Journey, LangToggle, MagicStage, Practice, Scene (Btn), StoryFilm, TouchSparkles, and the ui kit.
- **Activities:** clouds, forest, meadow, path, sky, studio, and the activity registry.
- **Data and server side:** audio, speak, voice (server and functions), story (server and functions), suggest, shared-garden (functions and schema), caregiver auth/guard/session, store, drafts, sessions, i18n, error capture, mcp.

## Confirmed defects
No Critical or High defects confirmed from code. The checks that passed earlier in this conversation still hold for code that hasn't changed since.

**Medium**
1. **Caregiver sign-in hides a failure** (caregiver-login.tsx:63). `.catch(() => {})` ignores the error, so an adult gets no message when this step fails. Confidence: medium. This needs a quick read to confirm what the call does. Smallest fix: show the existing translated error alert.
2. **Audio start/stop failures are ignored** (audio.ts:66 and 87). If `resume()` is rejected (Safari without a fresh tap), sound stays silent and nothing tells the user. Confidence: medium. Smallest fix: set the existing music status to "blocked" so the current "tap to play" message shows.

**Low**
3. **Non-null shortcuts on fixed lists** (`COLORS[0]!`, `EMOTIONS[2]!`, `NOTES[...]!` in studio.tsx and forest.tsx). These are safe today because the lists are constant, but they would break silently if a list were shortened. Smallest fix: typed tuple constants.
4. **Unused animation** left in styles.css: `bubble-rise` is no longer used by games. Cleanup only.

## Risks I couldn't confirm while the app was running
- **Safari speech and audio on a real iPhone:** handled by tap-unlock and shared speech state, but only tested with mocks and a desktop browser.
- **Timers and listeners** in games (3), the root layout (4), sky, meadow, StoryFilm and watch: the code shows cleanup, but long-session memory use wasn't profiled.
- **Shared garden access rules:** there's no migrations folder in this checkout, so I couldn't re-read the access rules from source. The next step is a read-only database query to confirm owner-only writes and the limited public view.
- **Video size:** 5.7 MB of bundled images, plus the films. Mobile loading time wasn't measured on a real cellular connection.
- **Story AI:** working earlier in this conversation; it depends on provider credits. The offline ready-made story still works without it.

## Privacy and security
- Children's drawings, feelings and progress are only saved on the device (store, drafts, sessions). No new data leaves the device.
- Only the sunflower stage is shared, and only when an adult opts in. Caregiver pages are behind a server-checked gate.
- The helper is the only child text sent off-device, and it's rate-limited.
- No misleading privacy wording was found in code. I still need to confirm the database access rules (see risks).

## Out of scope (ideas, not defects)
- Real-device performance profiling and a Lighthouse score.
- Shrinking video files and serving them in a more efficient format.
- More recorded character films.

## Proposed next step, after you approve
1. Read-only checks: database access rules, plus a fresh browser pass that collects console and network output.
2. Fix items 1 and 2 using the existing patterns, then items 3 and 4.
3. Run tests and lint, check the build, and report the results.
