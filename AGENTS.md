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
- Persist child-created content and preferences only in the device store; this account-free product explicitly requires private local functionality.
- Use semantic CSS tokens and the shared Btn control for new activity interactions, preserving the storybook design system.
- Synthesize all sounds in `src/lib/audio.ts` (no audio files) and gate every sound and voice on the saved sound settings, starting only after the first touch, to respect autoplay rules and keep the app light.
- Characters speak through the shared `CharacterSay` component with a visible caption, so spoken instructions always have a written equivalent.
- Back/Next order comes from one list in `src/content/sequence.ts`; add every new page there so navigation never dead-ends.
- The feelings helper (/helper) is the only feature that sends child text off-device: one Lovable AI call via a server function, nothing stored, and it may only recommend keys from `src/content/catalog.ts`.
- Ukrainian is the source language: write UI strings in Ukrainian and translate them via `t()`/`useT()` from `src/lib/i18n.ts` (never hardcode English); every new string needs a dictionary entry, guarded by `src/test/i18n.test.ts`.
- Natural voices go through `src/lib/voice.server.ts` (Lovable AI TTS) with app-written lines only, cached in memory, falling back to device speech; never send child-typed text there.
- Adult-only pages live under `src/routes/_caregiver/` (ssr:false gate confirmed by the `verifyCaregiver` server function); child routes stay public and no child data ever goes to the backend.
- Remote MCP tools use OAuth client-claim verification and expose only app-written catalog data; browser WebMCP reads only the visible map, keeping child device data inaccessible to agents.
- OAuth consent uses the existing caregiver sign-in with canonical local return paths preserved through password sign-in and email confirmation, so child routes remain account-free.
