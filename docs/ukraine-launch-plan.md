# Тихе Місце — Ukraine-first launch plan

Status: draft operations document · Created 2026-11-17 · Owner: Founder
Scope: website/PWA launch first; iOS App Store and Google Play prepared in parallel. This document changes no app behaviour.

> Legal notice: nothing here is a legal conclusion. Every item marked **[LEGAL]** requires review by qualified counsel (Ukrainian personal-data law, plus EU GDPR / UK / US COPPA where diaspora families are reached). Store approval is never guaranteed.

Evidence labels used throughout:
- **[V]** verified in the codebase on 2026-11-17
- **[I]** inferred risk (reasoned, not proven)
- **[M]** requires manual or physical-device verification

---

## 1. Executive objective and positioning

**Objective (EN):** Launch Тихе Місце as a free, Ukrainian-first emotional-wellbeing web app for children aged 5–13 and their caregivers, validate it with a 4-week opt-in pilot (30 families, 10 educators/psychologists), and reach store-submission readiness for iOS and Android without advertising, paywalls or child data collection beyond what is documented.

**Мета (UA):** Запустити «Тихе Місце» як безкоштовний україномовний застосунок емоційної підтримки для дітей 5–13 років і їхніх дорослих, перевірити його у 4-тижневому добровільному пілоті (30 родин, 10 освітян/психологів) і підготувати подання в App Store та Google Play — без реклами, без платного доступу і без збору даних дітей понад задокументоване.

**Positioning (EN):** A calm, storybook world where children name feelings, breathe, draw, listen to stories and grow a sunflower — supportive everyday practice, not therapy or a substitute for professional help.

**Позиціонування (UA):** Тихий казковий світ, де дитина називає почуття, дихає, малює, слухає казки й вирощує соняшник — щоденна підтримка, а не терапія і не заміна фахової допомоги.

Commitments: free for Ukrainian families; no ads aimed at children; no paywall; child content stays on the device except the documented flows in Phase C.

---

## 2. Verified codebase facts (snapshot)

| Area | Finding | Label |
|---|---|---|
| Stack | TanStack Start web app; PWA via vite-plugin-pwa (generateSW), registered only from `src/lib/pwa-register.ts`, refused on dev/iframe/preview hosts | V |
| Manifest | `public/manifest.webmanifest`: name/short_name "Тихе Місце", `lang: uk`, standalone, icons 192/512 + maskable | V |
| Root head | `<title>` and `apple-mobile-web-app-title` = "Тихе Місце"; `og:type` set; 31 route files define `head()` | V |
| SEO gaps | No `sitemap.xml`; no `rel=canonical`; no `og:image`/`og:url` anywhere; `robots.txt` allows all crawlers, no Sitemap line | V |
| Old brand | `README.md` title "Kryla Dobra Vnutrishnoho Svitu"; `src/lib/mcp/index.ts` MCP server name/title "kryla-dobra-vnutrishnoho-svitu"; published host `kryla-dobra-vnutrishnoho-svitu.lovable.app` | V |
| False positive | `src/activities/sky.tsx` "крила" = storks' wings in story text — not a brand reference, keep | V |
| Child data | Progress, drawings, settings in browser `localStorage` (`src/lib/store.ts`) | V |
| Caregiver gate | Adult pages under `src/routes/_caregiver/` (parents, shared-garden), server-checked; email/password sign-in, confirmation, reset | V |
| Account deletion | In-app "Видалити акаунт" on parents page → `deleteMyAccount` deletes shared sunflower row and auth user | V |
| Sunflower sharing | Adult opt-in; only a coarse stage via `grow_sunflower` RPC (≤1 stage/~20 h); public community garden reads stage projection only | V |
| AI | Story, helper and natural voice require signed-in account + per-account in-memory hourly caps; helper sends child text once, not stored; reports store AI output only (`ai_reports`) | V |
| Outside links | Garden credit links wrapped in `GrownUpLink` adult check | V |
| Privacy page | `/privacy` (UA/EN) describes device storage, visit statistics, Google Fonts, music storage, AI flows. Missing: controller identity and contact email | V |
| Analytics | Lovable first-party visitor analytics and click tracking enabled in publish settings; `__lovableEvents` used for errors/WebMCP telemetry; no third-party analytics SDK | V |
| Third parties | Google Fonts (`fonts.googleapis.com`), remotely hosted music/video files, Lovable Cloud (auth/db), Lovable AI gateway | V |
| Agent access | OAuth MCP exposing catalog data only; browser WebMCP map-only | V |
| Media | Several full story films generated; 5 story films and 6 character clips still short loops (roadmap open) | V |
| Devices | No physical iPhone/Android testing performed to date | M |
| Language | Ukrainian source strings with EN dictionary (`src/lib/i18n.ts`), test-guarded | V |

---

## 3. Owners

Founder (F) · Developer (D) · Ukrainian reviewer (UR — language, cultural, child-psychology tone) · Legal reviewer (L) · Pilot partner (P).

---

## Phase A — Brand consistency (Тихе Місце)

Do not change code in this task; these are change requests.

| # | Item | Owner | Pri | Depends | Acceptance |
|---|---|---|---|---|---|
| A1 | Rename README title to Тихе Місце (Tykhe Mistse) | D | P1 | — | `rg -i kryla` returns no brand hits in docs |
| A2 | Rename MCP server `name`/`title` in `src/lib/mcp/index.ts` | D | P1 | check MCP clients already connected | Manifest shows new name; existing OAuth clients still work [M] |
| A3 | Production URL without "kryla-dobra": rename published subdomain and/or attach custom domain | F, D | **P0** | domain decision (§10) | Public URL contains no old brand; old URL redirects or is retired |
| A4 | Add branded `og:image` (absolute URL) + `twitter:image` on home and key pages | D | P0 | final URL | Share preview in Telegram/Instagram/Facebook shows Тихе Місце [M] |
| A5 | Verify icons, splash/background, install prompt name on iOS and Android | D, UR | P1 | — | Home-screen label reads "Тихе Місце" on both [M] |
| A6 | Unique UA titles/descriptions per route reviewed by UR | UR, D | P1 | — | 100% content routes reviewed |
| A7 | Transliteration standard: "Tykhe Mistse" in EN copy, store listings, social handles | F | P1 | — | Handles reserved on Telegram, Instagram, TikTok, YouTube |

KPI: 0 public "Kryla Dobra" references at launch.

## Phase B — Website/PWA production readiness

| # | Item | Owner | Pri | Acceptance |
|---|---|---|---|---|
| B1 | Stable production domain (e.g. .com.ua / .ua or brand .app) + HTTPS | F, D | P0 | Domain live; old host redirected |
| B2 | `sitemap.xml` of public child + info routes (exclude `_caregiver`, auth, reset) and `Sitemap:` line in robots.txt | D | P0 | Valid in Google Search Console |
| B3 | `rel=canonical` on every public route pointing to production domain | D | P0 | No duplicate-URL warnings |
| B4 | `og:url`, `og:image`, `og:locale=uk_UA` (+ `en_US` alternate) | D | P0 | Preview debuggers pass [M] |
| B5 | Ukrainian-first keywords reviewed by UR (емоції для дітей, дихальні вправи, казки) — no clinical claims | UR | P1 | Copy approved |
| B6 | Install instructions page/section (iPhone Safari Share → На початковий екран; Android Chrome Install) | D, UR | P1 | Tested on 2 iOS + 2 Android devices [M] |
| B7 | Low-bandwidth test: 3G throttling, media lazy-loading, total first-load size budget | D | P1 | Home interactive < 5 s on Slow 4G [M]; films do not autoplay-download on cellular |
| B8 | Offline check: previously opened pages and cached media open in airplane mode | D | P1 | Pass on iOS + Android [M] |
| B9 | Audio/video on real devices: silent switch, lock screen, interruptions, Bluetooth | D | **P0** | All voices/music audible after first tap on iOS 16.4+ [M] |
| B10 | Accessibility: VoiceOver/TalkBack walk, captions present, 44px targets, reduced motion, contrast | D, UR | P1 | No blocker issues in 10 core flows [M] |
| B11 | Analytics decision: keep Lovable first-party analytics or disable click tracking for child pages | F, L | P0 | Decision recorded; privacy page matches [LEGAL] |
| B12 | Error monitoring review weekly | D | P1 | Runtime error rate tracked |
| B13 | Finish or explicitly defer 11 remaining films | F | P2 | Watch page has no broken items |

KPIs: Lighthouse PWA/a11y ≥ 90 on home [M]; 0 P0 device defects; Search Console indexed pages ≥ 20 within 30 days.

## Phase C — Safety and privacy readiness (ages 5–13)

### C1. Actual data-flow map

| Flow | Data | Where | Who sees | Retention | Review |
|---|---|---|---|---|---|
| Child play | progress, drawings, feelings choices, settings | device `localStorage` | nobody off-device | until browser data cleared | V |
| Caregiver account | email, password hash, auth metadata | Lovable Cloud auth | operator | until in-app deletion | V · [LEGAL] retention/backups |
| Sunflower sharing | owner id + coarse stage + timestamps | `shared_sunflowers` (owner RLS); public projection stage-only | other caregivers/public see stage only | until withdrawal/deletion | V |
| AI story | child's 3 choices (character, place, mood) | Lovable AI gateway → model provider | provider per its terms | not stored by app | V · [LEGAL] provider processing terms |
| AI helper | free text typed by child | sent once to AI gateway | provider | not stored by app | V · **[LEGAL] highest sensitivity** (child free text may contain personal info) |
| AI voice | app-written lines only | AI gateway TTS | provider | in-memory cache | V |
| AI reports | AI output + reporter user id | `ai_reports` | operator | undefined | V · define retention [LEGAL] |
| Visit analytics | pages, referrer, country, browser/OS/device, time on page, clicks, errors | Lovable analytics (first-party, cookie-free per Lovable) | operator, Lovable | per Lovable (privacy page cites 90 d / 1 y) | V · [LEGAL] child-directed analytics |
| Fonts | IP, user agent | Google Fonts | Google | Google policy | V · consider self-hosting [I] |
| Media files | IP, user agent | remote file storage/CDN | host | host policy | V |
| MCP/WebMCP | catalog/map data only | — | AI agents | — | V |

### C2. Checklist

| # | Item | Owner | Pri | Acceptance |
|---|---|---|---|---|
| C2.1 | Add data controller identity + contact email to `/privacy` | F, L | **P0** | Published |
| C2.2 | Legal review of privacy page vs Ukrainian Law "On Personal Data Protection", GDPR (diaspora EU), COPPA (US) | L | **P0** | Written sign-off |
| C2.3 | Decide whether AI helper is available in pilot/stores; consider adult-only or disabled for Kids-category builds | F, L | **P0** | Decision recorded |
| C2.4 | Confirm AI provider DPA/terms permit child-adjacent use | L | P0 | Documented |
| C2.5 | Retention policy for `ai_reports`, auth logs, analytics | L, D | P1 | Stated on privacy page |
| C2.6 | Self-host fonts to remove Google request on child pages [I] | D | P1 | No third-party font request |
| C2.7 | Safety content: distress keywords in helper text route to calm activity + "tell a trusted adult" + Ukrainian helplines reviewed by UR/psychologist | UR, P, D | P0 | Psychologist approval |
| C2.8 | Wording audit: no "no data collected", no clinical/therapy claims anywhere | UR, L | P0 | Pass |
| C2.9 | Confirm no child-targeted ads, no third-party ad/analytics SDK; any new SDK requires Apple Kids + Google Families evaluation first | D | P0 | SDK inventory = Lovable/Cloud only |
| C2.10 | Incident response: data/safety incident owner, 72 h assessment, notification template | F, L | P1 | Doc approved |

## Phase D — Opt-in pilot in Ukraine (4 weeks)

Targets: 30 families (children 5–13), 10 educators/psychologists. Recruit via 2–3 pilot partners (school, NGO, psychologist network).

- **Recruitment:** partner-shared invitation; adult signs up; quotas across age bands (5–7, 8–10, 11–13), at least 30% outside Kyiv, include displaced families where partners advise.
- **Informed adult consent [LEGAL]:** plain-Ukrainian form covering purpose, what data is collected (feedback forms only + existing app flows), voluntary withdrawal anytime, no payment pressure, contact.
- **Child assent:** short age-appropriate verbal/visual explanation read by the adult; child may stop at any time; no recording of children.
- **Feedback (weekly, adult-reported, 5-point + open):** Was it easy to start? Which places did the child return to? Did anything upset or confuse the child? Did sound/video work on your device (model, OS)? Would you recommend it to another family? Educators: classroom fit, language quality, safety concerns.
- **Incident/escalation:** any distress or harmful AI output → caregiver reports via form/Telegram within 24 h → Founder acknowledges in 24 h → psychologist partner reviews in 48 h → feature disabled if needed. Emergencies are directed to local emergency services; app is not a crisis service.
- **Success thresholds:** ≥ 70% families active in ≥ 3 of 4 weeks; ≥ 80% "easy to start"; average satisfaction ≥ 4/5; 0 unresolved safety incidents; ≤ 5 P0/P1 device defects open at end; ≥ 7/10 professionals would recommend.

| Week | Activity | Owner |
|---|---|---|
| 0 | Consent forms, partner MOU, device matrix, feedback forms | F, L, P |
| 1 | Onboarding call, install help | F, P |
| 2–3 | Weekly survey, defect triage | D, F |
| 4 | Exit survey, interviews (5 families, 5 pros), report | F, UR |

## Phase E — Ukrainian distribution channels

Channels: parent communities (Facebook groups, forums), Telegram channels for parents/teachers, Instagram, TikTok, YouTube (demo + how-to-install), schools and kindergartens (via methodologists), school psychologists and associations, public libraries, NGOs supporting children/displaced families, diaspora communities (PL, DE, CZ, UK, CA, US). Ads, if ever used, target adults only.

### First 30 days after public launch

| Days | Action | Owner | KPI |
|---|---|---|---|
| 1–3 | Launch post on own Telegram/Instagram/YouTube; 30 s demo | F | 1,000 views |
| 4–7 | Personal outreach to 20 partners (CRM) | F | 6 replies |
| 8–10 | 5 parent Telegram/Facebook groups (with admin permission) | F | 300 site visits |
| 11–14 | Webinar for school psychologists with partner | F, P | 40 attendees |
| 15–18 | Library/NGO toolkit (PDF one-pager + install steps) | F, UR | 10 orgs receive |
| 19–22 | TikTok/Reels: 3 short "how to breathe with the flower" clips (adult-facing) | F | 5,000 views |
| 23–26 | Diaspora: Ukrainian Saturday schools and communities | F | 5 partners |
| 27–30 | Review KPIs, publish pilot learnings | F | Report out |

### Partner CRM template

| Organization | Type | City/Country | Contact name | Role | Email/Telegram | First contact date | Status (New/Contacted/Meeting/Pilot/Partner/Declined) | Next step | Next step date | Notes |
|---|---|---|---|---|---|---|---|---|---|---|

## Phase F — App store readiness (parallel)

No approval is promised. A wrapped website risks rejection under Apple guideline 4.2 (minimum functionality) [I].

| # | Item | iOS | Android | Owner | Pri |
|---|---|---|---|---|---|
| F1 | Developer accounts (organization account preferred; D-U-N-S for Apple org) | Apple Developer Program | Google Play Console (org) | F | P0 |
| F2 | Native wrapper decision and build (outside this tool; needs Mac/Xcode) | ✓ | ✓ | D | P0 |
| F3 | Target audience: Kids Category age band / Families target ages 5–13 (spans multiple bands) | ✓ | Target audience & content | F, L | P0 |
| F4 | Age rating questionnaire | App Store Connect | IARC | F | P0 |
| F5 | Privacy forms: App Privacy "nutrition label" / Data safety section, consistent with Phase C map | ✓ | ✓ | F, L | P0 |
| F6 | Parental gate before outside links, sign-in, reports, purchases (GrownUpLink exists for links [V]; verify sign-in entry is gated [M]) | ✓ | ✓ | D | P0 |
| F7 | Account deletion in-app [V] + web deletion URL (Google requires) | ✓ | ✓ | D | P0 |
| F8 | SDK inventory: no ads/analytics SDKs; review Lovable analytics inside wrapper [LEGAL] | ✓ | Families Self-Certified SDKs only if ads ever | D, L | P0 |
| F9 | Support URL, privacy URL, marketing URL on production domain | ✓ | ✓ | F, D | P0 |
| F10 | Screenshots (6.7"/6.5" iPhone, iPad if supported; phone/tablet Android), UA + EN listings | ✓ | ✓ | F, UR | P1 |
| F11 | Review notes with demo caregiver account | ✓ | ✓ | F | P1 |
| F12 | Review-device testing: oldest supported iOS/Android, small screens, offline | ✓ | ✓ | D | P0 [M] |
| F13 | AI content disclosures and reporting (ReportAi exists [V]) | ✓ | AI-generated content policy | F, L | P0 |

Compliance references (check current versions before submission):
- Apple App Store Review Guidelines — 1.3 Kids Category, 5.1.1(v) account deletion, 5.1.4 Kids, 4.2 Minimum functionality: https://developer.apple.com/app-store/review/guidelines/
- Apple — Kids apps / parental gates: https://developer.apple.com/kids/
- Apple — App privacy details: https://developer.apple.com/app-store/app-privacy-details/
- Google Play — Families policy & Designed for Families: https://support.google.com/googleplay/android-developer/answer/9893335
- Google Play — Target audience and content: https://support.google.com/googleplay/android-developer/answer/9867159
- Google Play — Data safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Google Play — Account deletion requirement: https://support.google.com/googleplay/android-developer/answer/13327111
- Google Play — AI-generated content policy: https://support.google.com/googleplay/android-developer/answer/13985936
All require **[LEGAL]** review.

---

## 4. Funding strategy

- **Public commitment:** "Тихе Місце безкоштовне для українських родин. Без реклами для дітей і без платного доступу." Publish on site and listings.
- **Grants:** research programs from mental-health/psychosocial support funders, child-protection and education donors, EU/humanitarian digital programs, Ukrainian foundations. No specific open grant or deadline is asserted here — Founder verifies each call directly.
- **Sponsorship:** adult-facing acknowledgement only (about page, partner list); sponsors get no data, no in-app child-facing branding.
- **Institutional partnerships:** schools, NGOs, municipalities co-fund pilots in exchange for training and aggregated, anonymous feedback reports.
- **Readiness pack:** pilot report, privacy summary, budget (hosting, AI credits, media, review, legal), impact metrics (non-clinical: engagement, satisfaction, professional feedback).

---

## 5. Ready-to-use copy (review by UR before use; no clinical claims)

**Опис (UA):** «Тихе Місце» — безкоштовний казковий світ для дітей 5–13 років, де можна назвати свої почуття, спокійно подихати разом із квіткою чи хвилею, помалювати, послухати казку й виростити власний соняшник. Створено українською, без реклами й без платного доступу. Те, що дитина малює та обирає, залишається на пристрої. Це щоденна підтримка, а не заміна допомоги фахівця.

**Description (EN):** Tykhe Mistse ("Quiet Place") is a free storybook world for children aged 5–13 to name their feelings, breathe calmly with a flower or a wave, draw, listen to stories and grow their own sunflower. Made in Ukrainian, with no ads and no paywall. What a child draws and chooses stays on the device. It is everyday support, not a replacement for professional help.

**Пост (UA):** 🌻 Запускаємо «Тихе Місце» — безкоштовний україномовний застосунок для дітей 5–13 років. Дихальні вправи, казки, малювання й сад соняшників, щоб разом говорити про почуття. Без реклами. Відкрийте на телефоні й додайте на початковий екран: [посилання]

**Post (EN):** 🌻 Meet Tykhe Mistse — a free, Ukrainian-language app for children 5–13: breathing games, stories, drawing and a sunflower garden to help families talk about feelings. No ads. Open it on your phone and add it to your home screen: [link]

**Лист партнеру (UA):**
Тема: Безкоштовний застосунок «Тихе Місце» для дітей — запрошення до пілоту
Вітаю, [ім'я]! Ми створили «Тихе Місце» — безкоштовний україномовний застосунок, де діти 5–13 років через казки, дихання й малювання вчаться називати почуття. Шукаємо 2–3 партнерів для 4-тижневого добровільного пілоту з родинами й фахівцями. Участь безкоштовна, дані дітей не збираються понад описане в політиці приватності. Чи зручно поговорити 20 хвилин наступного тижня? [підпис]

**Partner email (EN):**
Subject: Free children's app Tykhe Mistse — pilot invitation
Hello [name], we built Tykhe Mistse, a free Ukrainian-language app helping children 5–13 name feelings through stories, breathing and drawing. We are inviting 2–3 partners to a voluntary 4-week pilot with families and professionals. Participation is free, and child data is handled only as described in our privacy policy. Could we talk for 20 minutes next week? [signature]

**30-second demo script (UA / EN):**
- 0–5 s: welcome screen, sunflower fields. «Це Тихе Місце.» / "This is Tykhe Mistse."
- 5–12 s: World map, tap Meadow. «Тут можна зупинитися й подихати разом із квіткою.» / "Here you can pause and breathe with a flower."
- 12–18 s: flower opens and closes. «Вдих — квітка розкривається, видих — складається.» / "Breathe in, it opens; breathe out, it closes."
- 18–24 s: story and drawing. «Казки й малювання допомагають говорити про почуття.» / "Stories and drawing help talk about feelings."
- 24–30 s: garden sunflower grows; end card. «Безкоштовно для українських родин. Без реклами.» / "Free for Ukrainian families. No ads."

---

## 6. Launch dashboard

Status values: Not started · In progress · Blocked · Done · Deferred.

| Pri | Item | Owner | Status | Blocker | Due |
|---|---|---|---|---|---|
| P0 | A3/B1 Production domain without old brand | F, D | Not started | domain decision | |
| P0 | C2.1 Controller + contact on privacy page | F | Not started | contact details | |
| P0 | C2.2 Legal review of privacy & data flows | L | Not started | counsel engaged | |
| P0 | C2.3 AI helper scope for children | F, L | Not started | decision | |
| P0 | C2.7 Distress handling reviewed by psychologist | UR, P | Not started | partner | |
| P0 | B11 Analytics/click-tracking decision | F, L | Not started | | |
| P0 | B9 Real-device audio/video check | D | Not started | devices | |
| P0 | A4/B2–B4 OG image, sitemap, canonical | D | Not started | domain | |
| P1 | A1/A2 Remove Kryla Dobra from README/MCP | D | Not started | | |
| P1 | B6–B8, B10 install, low-bandwidth, offline, a11y | D, UR | Not started | devices | |
| P1 | D Pilot setup (consent, partners) | F, L, P | Not started | C2.2 | |
| P1 | F1–F2 Store accounts + wrapper decision | F, D | Not started | budget | |
| P2 | B13 Remaining 11 films | F | Blocked | credits | |

**Weekly review (every Monday, 30 min):** Founder chairs; review P0 status, new incidents, KPI table (visits, installs [M via analytics], active pilot families, satisfaction, defects open, partner pipeline), decide next week's top 3. Monthly: legal/safety review and funding pipeline.

---

## 7. Manual / physical-device verification list [M]

iOS Safari + home-screen app (iOS 16.4+ and oldest target), Android Chrome: first-tap audio unlock, silent switch, lock-screen interruption, AI voice when signed in, offline reopen, install label/icon, share previews, VoiceOver/TalkBack, low-bandwidth film behaviour, caregiver email confirmation delivery to Ukrainian mail providers (ukr.net, i.ua, Gmail).

## 8. Inferred risks [I]

- Child free text in helper may include identifying details → provider exposure.
- Click tracking on child pages may conflict with store kids policies.
- Google Fonts request from child pages = third-party IP exposure.
- 5–13 spans multiple Apple age bands; may require choosing one or Kids 9–11 + separate positioning.
- In-memory AI caps reset on server restart; not a hard spend limit.
- Wrapped-website store builds risk 4.2 rejection.
- Old subdomain may persist in shared links/search after rename.

## 9. Validation of this document

Markdown only; no application code, routes, assets, database, auth, analytics or deployment settings were changed; not published.

## 10. Launch decisions still required

1. Production domain name and registrar.
2. Legal entity / data controller and public contact email.
3. AI helper availability for children (on / adult-only / off) in web and store builds.
4. Keep or disable click tracking/visitor analytics on child pages.
5. Store age band(s) and native-wrapper approach/developer.
6. Pilot partners and psychologist reviewer.
7. Whether to finish or defer remaining 11 films.
