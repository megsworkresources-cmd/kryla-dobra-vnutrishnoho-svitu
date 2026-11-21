# Queued resources and uploaded-asset review — 2026-11-21

## Task/run status

`get_tasks {}` returned **No unfinished tasks** (seven finished tasks not listed). No running verify-media/vitest/eslint/ffmpeg process at inspection. HEAD is **47dc424**, newer than 8227ec9: the requested verification had already finished and committed. There was no active worker waiting for input or evidence of a currently credit-blocked run. No paid operation attempted and no claim made about remaining credit balance. A still-running/queued label elsewhere is stale or outside the background-task registry; no task ID exists here to cancel. This turn performs the queued accessible review synchronously and commits it.

## Resource review and fixes

- Read every bilingual directory entry (39), all 18 categories, filter metadata, all crisis contacts, seven parent-library topics and the uploaded resource brief. Unknown prices remain undefined; no new contacts invented.
- Fresh HTTP retrieval of all 39 official URLs: **35 HTTP 200**, **one HTTP 202 challenge (e-school)**, **three HTTP 403 (UNHCR, Save the Children, Council of Europe)**. NSZU initially returned 200 then returned 403 on retry; marked blocked conservatively. Child Mind Institute now accessible; marked ok. HTTP status proves retrieval, not eligibility, current programme delivery, clinical accuracy or licensing.
- Updated link-check date to 2026-11-21. Retained blocked badges for unavailable sites. No directory entries removed.
- Official angelscare.org.ua title/body identifies **Опіка Ангела**; corrected previously mismatched Ukrainian “Янголи поруч”. English name retained. English mode now puts the English organization name first, with Ukrainian subtitle; Ukrainian mode does the reverse.
- Fixed contradictory help copy: 112 serves Ukraine/EU; other listed numbers are intended for Ukraine, with international reach unconfirmed. Existing numbers retained.
- Removed unverified psychiatry/group/programme guarantees from UA Mental Help description; its retrieved homepage confirms psychological help, hotline/chat/self-help. Eligibility directed to provider.
- Parent anxiety guidance now supports voluntary, ready-for steps rather than pressure. No diagnostic/treatment promise.
- Resource page metadata no longer describes the entire directory as verified; current conditions must be confirmed with providers.

### Contacts and limitations

- Voices of Children homepage confirms **0800 210 106**, free within Ukraine, **9:00–20:00**. Its guessed `/en/contacts` endpoint returns 404 and was not added anywhere.
- UA Mental Help homepage confirms **0 800 331 200**, free from Ukrainian numbers, **daily 10:00–21:00**.
- La Strada `/en/kontakty` and `/kontakty` return 200 and confirm **116111 / 0800500225** and **116123 / 0800500335**, free/anonymous/confidential, around the clock. No additional hours or contact channels added.
- NPA homepage opens, but the checked support subpath returned 404; current **0800100102** service/hours not independently confirmed here. Existing government-listed number retained, with hours explicitly unconfirmed. NSZU 1677, government 1547/1548 current availability not independently reconfirmed. No telephone calls were made.
- Regional eligibility, exact ages, language availability and clinical service scope for every organization were not independently certified; entries are directory guidance, not a guarantee of access. Existing unknown prices and availability notices preserved.

### Resource browser verification

`python3 /tmp/browser/resources/check_resources.py` exit 0: `/resources` at **320×568, 393×852 and 1280×1800 × UK/EN** (six scenarios). All 39 cards, search for angelscare, language-specific primary title, empty result, reset and early-childhood filter passed. No horizontal overflow or page errors. Phone screenshots inspected: readable card fields, bilingual names, contact controls and fixed navigation. Browser does not establish real emergency-call connectivity or physical iPhone behavior.

## Six-MP4 correction — user filesystem inventory, not independently inspected footage

The uploaded set totals **six MP4s**, per the user's direct filesystem inventory correction (2026-11-21, 20:52 UTC): **three Hailuo `...Shadow_to_Bloom...mp4` files and three `output_720x1280...mp4` files**. Five is an incorrect count. Filename patterns below are supplied fragments, not invented full filenames. Dimensions are actual reported frame sizes, regardless of the output filename:

| Reported item / filename pattern | Frame size | Frame rate | Duration | Content / provenance | Independent access in previous review |
|---|---|---|---|---|---|
| Hailuo copy 1: `...Shadow_to_Bloom...mp4` | 896×512 | 30 fps | 6.6 s | Hailuo; watermark/licensing not independently inspected | Raw bytes unavailable |
| Hailuo copy 2: `...Shadow_to_Bloom...mp4` | 896×512 | 30 fps | 6.6 s | Second copy with the same reported metadata; byte identity not verified | Raw bytes unavailable |
| Hailuo variant 3: `...Shadow_to_Bloom...mp4` | 1344×768 | 24 fps | 6.592 s | Hailuo alternate variant | Raw bytes unavailable |
| Output variant 1: `output_720x1280...mp4` | 630×360 | 24 fps | 10.228 s | Renderforest-watermarked scene, per user | Raw bytes unavailable |
| Output variant 2: `output_720x1280...mp4` | 910×512 | 30 fps | 8.067 s | Same Renderforest-watermarked scene, per user | Raw bytes unavailable |
| Output variant 3: `output_720x1280...mp4` | 1280×720 | 30 fps | 8.067 s | Same Renderforest-watermarked scene, per user | Raw bytes unavailable |

The previous review checked both read-only upload mount and mirror recursively and found **zero accessible raw MP4/MOV/WebM uploads in that environment**. The available `app-source-code.zip` contained nine existing `.mp4.asset.json` pointers, **not raw MP4 footage**, no Hailuo/Renderforest-named entries. That access limitation does not contradict the user's six-file filesystem inventory. Dimensions, rates, durations and the shared Renderforest scene are now recorded from the user's correction, not claimed as independently measured or viewed. Full filenames, hashes, watermark frames and license documents remain unavailable to that review. The earlier single “6.6s Hailuo” mention is not a complete inventory and cannot establish repository presence.

Precisely blocked: independent six-video visual/audio/metadata/quality/provenance review requires those bytes or accessible source references; the previous review could not access them in its mount/archive. No new filesystem inspection or playback test was performed for this documentation correction. No substitute existing film claimed as one of these six. No render, download, paid generation, watermark removal or media integration attempted. Watermarked previews do not establish redistribution rights; preserve them only as reported candidates until source/licensing can be inspected.

### Accessible assets reviewed

- **24 uploaded still images**, opened as a labelled contact sheet: three painterly landscape/forest references; 19 annotated app screenshots (IMG_0904–0915, IMG_1112–1114, IMG_1161–1164); two original character drawing references. Images match previously preserved references/requests; no new copying or imported book material. Screenshot originals 886–898×1920; style references 1024×1024 and 1522–1529×860; drawings 1424×1085 / 1997×1377.
- **19 existing app MP4s** in `public/media/video`: ffprobe succeeded for all, H.264, duration **6–30.041667s**. Six character clips 720×1280 / 6s; four full story clips 1280×720 / 30.041667s; growth footage 440×768 / 7.533333s; eight remaining clips 1920×1080 / 8–10s. These are existing app footage, not the missing uploads. Metadata does not prove content quality/license or full playback.
- No working asset removed/replaced; no generic media or copyrighted book content integrated.

## Verification records

Focused resource regression now retains 39 unique bilingual entries with valid HTTPS/filter references, unknown prices and 13 exact crisis contacts. Final commands/results:
- `bun run lint`: exit 0, `$ eslint .`, no warnings/errors.
- `bunx vitest run`: exit 0, **56 files / 296 tests**, started 20:50:19 UTC; includes 15 resource regressions and full i18n guard.
- `python3 scripts/verify-media-garden.py`: exit 0, four actual Watch play/exit scenarios, four mobile signed-out caregiver entry and four authenticated offline/reconnect scenarios, zero page errors. Garden mutations remain intercepted; no live writes.
- `python3 /tmp/browser/resources/check_resources.py`: exit 0, six UK/EN resource scenarios (search/filter/empty/reset).
- `/tmp/observability/build-errors.log`: latest available **2026-11-21T20:50:01Z: build OK** after source edits. No command/flags/exit-status or separate typecheck output exposed; `/tmp/observability/typecheck-errors.log` absent. No manual production build/typecheck executed, as prohibited by this environment. No standalone production/typecheck success claimed.

Temporary evidence under `/tmp/browser/resources`; no private account/session values printed or copied.

No publishing, deployment, Cloud/database/auth/infrastructure changes. Physical-device audio, standalone production/typecheck command output, actual six-video review and blocked external-service availability remain unverified; accessible work is complete rather than left running.