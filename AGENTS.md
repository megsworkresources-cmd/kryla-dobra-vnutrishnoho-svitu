<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep destination routes separate from reusable activity modules and browser-safe content data, so every exercise has its own address and completion flow.
- Keep child-created content and preferences in the device store; only an explicitly opted-in coarse sunflower stage may be sent from the caregiver garden, never child identity or activity records.
- Normalize invalid device settings on read without rewriting storage; retain valid child content and progress so recovery is non-destructive.
- Keep recorded music cancellation synchronous, expose playback failures, and bound decoded caches; late media responses must never restart an exited activity.
- Use semantic CSS tokens and the shared Btn control for new activity interactions, preserving the storybook design system.
- Use CDN-hosted recorded Ukrainian instrumental tracks for background music and synthesize only interface/game sounds in `src/lib/audio.ts`; gate every sound and voice on saved settings and start only after the first touch, to respect autoplay rules while keeping recordings out of the repository.
- Characters speak through the shared `CharacterSay` component with a visible caption, so spoken instructions always have a written equivalent.
- Back/Next order comes from one list in `src/content/sequence.ts`; add every new page there so navigation never dead-ends.
- Place the single main landmark around the root Outlet; shared scene frames use non-landmark containers so every page has exactly one main.
- Exercise completion must use state/timers, never depend on animation events, so reduced-motion settings cannot block progress.
- Recorded story footage uses StoryFilm for muted inline playback, interruption handling and failures; story owners retain captions and narration.
- Listening-stage interactions rotate among tracing, memory and garden building without persisting child choices or gating exercise completion.
- Keep memory-card dealing in browser-safe content helpers with a deterministic initial deck and shuffle after hydration, so server markup and accessible card identities remain stable.
- The feelings helper (/helper) is the only feature that sends child text off-device: one Lovable AI call via a server function, nothing stored, and it may only recommend keys from `src/content/catalog.ts`.
- Ukrainian is the source language: write UI strings in Ukrainian and translate them via `t()`/`useT()` from `src/lib/i18n.ts` (never hardcode English); every new string needs a dictionary entry, guarded by `src/test/i18n.test.ts`.
- Natural voices go through `src/lib/voice.server.ts` (Lovable AI TTS) with app-written lines only, cached in memory, falling back to device speech; never send child-typed text there.
- Reuse a gesture-primed audio element for delayed narration and pause automatic natural-voice requests after terminal service errors; explicit listening retries remain available.
- Adult-only pages live under `src/routes/_caregiver/` (ssr:false gate confirmed by the `verifyCaregiver` server function); child routes stay public. Shared sunflower requests independently revalidate the caregiver and never access child content.
- Account identity transitions use one root Auth subscriber; logout cancels and clears query caches without touching the device store, and recovery readiness requires a current Auth user.
- Remote MCP tools use OAuth client-claim verification and expose only app-written catalog data; browser WebMCP reads only the visible map, keeping child device data inaccessible to agents.
- OAuth consent uses the existing caregiver sign-in with canonical local return paths preserved through password sign-in and email confirmation, so child routes remain account-free.
- Keep ready-made story fallback browser-safe and app-written, and display it as prepared rather than AI-generated; network/configuration failures must not remove offline stories.
- Measure the fixed navigation bar for its content spacer, so translated labels, large text and safe areas cannot obscure the last controls.
- Derive narration controls from shared speech lifecycle state, not optimistic button toggles, so failed or completed playback cannot leave a false Stop state.
- Shared garden mutations go only through the definer grow_sunflower RPC (one stage per ~day, no direct table writes) with owner RLS for read/delete; explicit adult updates prevent child routes from sending data.
- Keep human-cast cartoon and animal-cast bridge footage separate; video remains silent inline and captions/narration stay app-owned.
- Public community garden reads use only the publishable stage projection and fail closed if unavailable; never bypass table RLS with an admin fallback.
- AI server functions (voice, story, helper) require a signed-in account via requireSupabaseAuth plus a per-account in-memory cap and output caps, so anonymous callers cannot spend AI credits; signed-out children fall back to device speech, prepared stories and a sign-in prompt.
- Offline/home-screen support: vite-plugin-pwa generateSW (manifest in public/), registered only from `src/lib/pwa-register.ts`, which refuses dev/iframe/preview hosts; navigations NetworkFirst so deploys stay fresh.
- Outside links on child pages go through GrownUpLink (adult check) and AI output offers ReportAi, storing only AI output, never child text, to meet kids-app store rules.
- Render the GrownUpLink dialog into document.body with createPortal so card backdrop filters and scene animations cannot clip or reposition the viewport adult check.
- Family resource directory data is bilingual in `src/content/resources.i18n.ts` (each entry holds uk+en); unknown facts stay undefined and render as "not confirmed" so contacts are never invented.
- Fixed-list access uses browser-safe content helpers with explicit fallbacks; routes export only their route so activity rules remain independently testable.
- PWA generation, precache scanning and verification share the resolved deployed client directory; never assume .output/public. Account/OAuth pages are never runtime-cached.
- Share Workbox options with the standalone browser acceptance fixture, so caching tests exercise the production policy without registering workers in preview.
- Drive all breathing-scene motion from one pauseable clock and suppress visual frames for saved or system reduced motion; independent decorative loops must not outlive Pause.
- Story adventures share one QuestView module with bilingual content in src/content/quests.i18n.ts; each adventure is a thin route.
- Recorded videos share browser-only focus ownership and honor saved/system reduced motion; late playback and background events cannot restart exited footage.
- Shared-garden mutations use networkMode always with an offline guard and no retry, never Query's deferred mutation queue; offline status cannot imply confirmed sharing.
