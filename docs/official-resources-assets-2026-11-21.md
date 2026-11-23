# Official resources and uploaded assets — separate follow-up, 2026-11-21

## Scope and saved history

Continued from `b712295`, retaining the completed tranche-3 verification in `47dc424`, queued review in `284bcbd`, and corrected six-MP4 inventory. No new project/pages, database/auth/policy changes, publishing or deployment. Child data and existing footage remain untouched.

## Official source evidence and implemented decisions

Six requested pages retrieved through website-fetch and saved privately under `/tmp/resource-source-review`. Retrieval alone is not proof of service delivery, availability, licensing or telephone connectivity.

| Source | Evidence retrieved | Decision |
|---|---|---|
| [Cabinet of Ministers](https://www.kmu.gov.ua/news/vseukrainska-prohrama-mentalnoho-zdorovia-ty-iak-kudy-zvertatysia-za-dopomohoiu) | Publication dated 2023-06-02 explicitly lists 116111 (mobile) and 0800500225 (mobile/landline) for children/youth | Added official source card; retained both numbers. Historical hours not presented as freshly verified availability |
| [UNHCR support directory](https://help.unhcr.org/ukraine/uk/ukraine-uk-where-to-seek-help-ua/supporting-your-feelings-and-worries-ua/) | Current 2026 partner directory, NPA 0800100102, La Strada 116123 and government 1547; NPA shown 09:00–17:00 | Replaced general UNHCR landing link with exact support directory; successful content retrieval supersedes earlier blocked status. Regional contacts remain on authoritative site, not duplicated |
| [NPA help](https://help.npa-ua.org/) | Ukraine 0800100102, overseas numbers; Ukrainian hours “9:00 до 5:00”, English “09:00 AM to 05:00 AM” | Replaced old NPA link with actual help service. Conflicting/ambiguous schedules versus UNHCR and historical KMU: show “check the official site for hours”, not guessed hours |
| [UNICEF Ukraine YouTube](https://www.youtube.com/@UNICEFUkraine1997) | Returned channel content with UNICEF Ukraine attribution, organization website, education/rights playlists; mixed war/mine-safety content. Response also contains an initial 401 banner | Added only adult/educator selection card, with preview-before-sharing and YouTube advertisements/recommendations warning. No embed, downloads, arbitrary channels, or blanket child-safe claim. Channel playback/ads not tested |
| [Ministry of Education article](https://mon.gov.ua/news/distantsiyni-platformi-dlya-navchannya-samorozvitku-ta-otrimannya-dopomogi-y-perevirenoi-informatsii) | Canonical page opens and explicitly states NUMO online kindergarten ages 3–6 | Refined existing NUMO audience description |
| [Children's government directory](https://dity.gov.ua/en/resources/to-watch) | Sparse category navigation, no individual recommendations in retrieved content | No new recommendation card or child-age guarantee from an empty category |

**Canonical MON URL actually retrieved:** `https://mon.gov.ua/news/distantsiyni-platformi-dlya-navchannya-samorozvitku-ta-otrimannya-dopomogi-y-perevirenoi-informatsii` (no space in `samorozvitku`, `dopomogi` spelling). Article confirms NУМО online kindergarten ages **3–6**. Existing NUMO card now explicitly identifies that age range and adult-guided educational—not treatment—use; broad filter buckets remain, not an eligibility guarantee.

Official UNICEF Ukraine website also retrieved (`https://www.unicef.org/ukraine/`); existing UNICEF resource cards preserved. No copying of its stories/art/media into app.

Directory now has **41** bilingual entries (39 preserved plus official KMU evidence and adult-selected UNICEF channel). All have HTTPS destinations. Existing uploaded placeholder lists were not imported or used as evidence: `resources.ts` and `resources 2.ts` are absent from both mounts and available ZIP, so byte identity/no-href claims remain user-supplied, not independently measured. Current app already had real URLs, not placeholder-only rows.

Emergency dispatch **112/101/102/103** now has its own heading/list, separate from counselling/administrative support lines. No new child hotline invented. Last checked date remains **2026-11-21**, explicitly a link/content check rather than real-world service certification. Unknown service details/costs remain unconfirmed.

## Screenshot-found repair

At 320×568 the adult-link dialog was clipped above the viewport and painted below navigation because a card's backdrop filter and the scene animation created fixed-position containing/stacking contexts. Moved only its overlay to `document.body` using `createPortal`, preserving consent wording, cancel/confirm, focus trap, focus restoration and no outbound navigation before confirmation. Dialog/card can scroll on small screens. Added portal regression and real browser full-viewport/control-bound checks. No privacy gate loosened.

## Asset rights and transfer decisions

The **six**, not five, MP4 inventory and exact supplied metadata are retained in `docs/resources-assets-review-2026-11-21.md`: three `...Shadow_to_Bloom...mp4` Hailuo files (two 896×512 / 30fps / 6.6s copies; one 1344×768 / 24fps / 6.592s); three `output_720x1280...mp4` Renderforest variants (630×360 / 24fps / 10.228s; 910×512 / 30fps / 8.067s; 1280×720 / 30fps / 8.067s). All output variants depict the same watermarked scene per user. Full filenames cannot be supplied from filename fragments.

Fresh recursive inspection: both `/mnt/user-uploads` and `/tmp/user-uploads` contain **zero raw MP4/MOV/WebM, PDF or TypeScript files**. Available `app-source-code.zip` has none of those raw media/PDF files or either named placeholder source. Therefore no uploaded film imported, decoded, visually inspected or playback-tested; supplied count/metadata are not independent measurements. Hailuo 1344×768 is a potential highest-resolution source candidate only, pending actual bytes, clean/license inspection and matching-story playback. No placeholder mapping. All three watermarked Renderforest exports excluded; no watermark removal or crop.

**Concept sketch is accessible**, correcting any generic claim that this JPG was missing: `IMG_771B310AF7CC-1.jpg` **1424×1085**, opened and confirmed three-pose/concept layout with braided brown hair, purple top, blue trousers and sunflower. `IMG_9BB82FF2B2E4-1.jpg` **1997×1377** is the existing braided-girl portrait reference. Both remain reference-only; no flattened production art, new transfer or visual identity change.

Reported book bibliography (user-supplied; PDFs unavailable here):
- Аліна Штефан, **«Калюжа»**, Ranok; illustrations Марічка Трушковська.
- Настя Музиченко, **«Сни для канапи»**, Ranok; illustrations Оксана Драчковська.

Copyrighted/private references only. No text/pages/illustrations copied, published, redistributed, narrated, adapted, or sent for generation. No PDF copies moved into public/project assets. Any original uploaded PDFs remain untouched in their source location; this environment cannot claim to have preserved an inaccessible binary copy.

Original-writing proposals only, not added stories/features: a child chooses a quiet pause between two daily activities (transitions/slowing down); a caregiver and child choose a familiar goodnight signal (bedtime separation/reassurance). Future writing must use independent app expression, cast, events and artwork—not book plot, characters or sequencing. Existing bedtime/puddle/adventure content preserved.

**Attachment blocker resolution:** attach the original six MP4 files, two PDFs and two TS files directly to this project's chat (or one ZIP preserving their filenames). They currently are not in this environment's upload mounts; a filesystem inventory from elsewhere does not transfer bytes. The concept JPG does not need reattaching.

Fresh ffprobe of all **19 existing app MP4s** succeeded; exact filenames, dimensions, frame rates and durations retained in the table below. No duplicates removed or working footage replaced. This pass measures metadata, not new full-playback/license certification.

| Existing file | Size | fps | Duration (s) |
|---|---|---|---|
| bridge-friends.mp4 | 1920×1080 | 24 | 8 |
| bridge-story-full.mp4 | 1280×720 | 24 | 30.041667 |
| character-daryna.mp4 | 720×1280 | 24 | 6 |
| character-lihtaryk.mp4 | 720×1280 | 24 | 6 |
| character-marko.mp4 | 720×1280 | 24 | 6 |
| character-olenka.mp4 | 720×1280 | 24 | 6 |
| character-solomiya.mp4 | 720×1280 | 24 | 6 |
| character-taras.mp4 | 720×1280 | 24 | 6 |
| goodnight-friends.mp4 | 1920×1080 | 24 | 8 |
| kite-breeze.mp4 | 1920×1080 | 24 | 10 |
| kite-story-full.mp4 | 1280×720 | 24 | 30.041667 |
| lantern-friends.mp4 | 1920×1080 | 24 | 10 |
| lantern-story-full.mp4 | 1280×720 | 24 | 30.041667 |
| painting-friends.mp4 | 1920×1080 | 24 | 8 |
| rain-friends.mp4 | 1920×1080 | 24 | 8 |
| recorded-sunflower-growth.mp4 | 440×768 | 30 | 7.533333 |
| sunflower-field.mp4 | 1920×1080 | 24 | 10 |
| sunflower-story-full.mp4 | 1280×720 | 24 | 30.041667 |
| woodland-bridge.mp4 | 1920×1080 | 24 | 8 |

## Verification

Browser command: `python3 /tmp/browser/resource-followup/check_resources_followup.py`, exit **0**, six `/resources` scenarios: **320×568, 393×852, 1280×1800 × UK/EN**. Verified 41 cards, separate emergency/support headings, NPA and UNICEF search, empty/reset/filter, no horizontal overflow/page errors, adult cancellation/no open and explicit confirm/exact HTTPS destination. Dialog overlay equals viewport and both controls stay visible with ≥44px heights. Outbound `window.open` intercepted: proves routing/consent, not external page playback. An initial test instrumentation error accidentally invoked its window.open stub while installing it; replaced with function-wrapped installation and reran. Initial English unit selector corrected to actual “Yes, open it”; neither was an app defect.

Final full lint/test and managed build records appended after the portal repair. Manual application builds/typechecks are prohibited in this environment; only the managed signal can be inspected. No standalone production/typecheck success, physical iPhone audio, emergency calls, email flows or uploaded-video playback claimed.