# Random Wheel — 13 Candidate URLs: Independent SEO Quality Audit

**Audit date:** 2026-11-11 (Asia/Singapore)  
**Reviewed revision:** \`3f89283d8bfe10bf58d6137577c057025466aea5\`  
**Decision owner:** editorial / SEO release gate; the review is **not** index authorization.  
**Overall status:** **0 approved for indexing; 8 priority remediations; 5 hold / consolidation candidates.**  
**Index controls:** Do not modify production \`PUBLIC_INDEXABLE\`, \`LAUNCH_ROUTES\`, \`indexApproved\`, or candidate \`noindex\` from this audit alone.

## Evidence and limitations

1. **Code-level individual page inspection:** \`src/data/ranges.ts\`, \`src/pages/random-number-wheel/[range].astro\`, independent letter/yes-no/word Astro pages, \`src/components/Workbench.astro\`, \`src/scripts/wheel.ts\`, \`src/lib/site.ts\`, and \`src/pages/sitemap.xml.ts\`.
2. **Existing engineering evidence:** GitHub Actions \`42990951090\` (quality) and \`42990950966\` (Cloudflare live smoke), both successful for the reviewed revision. They establish buildability, representative interactions, and that the deployment contained the expected page markup. They **do not** establish indexing, search ranking or conversions.
3. **Demand evidence:** owner's private, US Semrush keyword export dated **2026-11-09**. Volumes, KD and competitor page traffic are **third-party estimates** and not WheelCanvas traffic. The full 898-row workbook is stored separately and intentionally excluded from this public report.
4. **Public competitor spot-checks:** discovered publicly accessible example landing pages for representative queries, not a location-controlled, complete Google US SERP export; their presence must not be presented as a verified top-10 rank.
5. **Current limits:** no verified Search Console property, real US search clicks/queries, independent direct HTTP response/header check in this audit, field Core Web Vitals or manual Safari/iPhone screen-reader testing. The previous Cloudflare CI smoke is evidence, but not a substitute for those checks.

## Release gate — all seven conditions required before a candidate can be indexed

| Gate | Acceptance threshold | Audit state |
|---|---|---|
| G1 — working first-load tool | Correct preset, accessible single draw, error handling, no-repeat and download as advertised; mobile 320/390px | Previously automated; confirm after remediation |
| G2 — exact search intent | Page can satisfy its primary query immediately; wheel-vs-generator nuance made explicit | Reviewed; actions below |
| G3 — independent user value | Page adds useful range-specific interaction, task workflow or original explanatory material beyond substituting the \`max\` value | Failed for the numeric-template cluster |
| G4 — editorial / trust | Accurate probability and scope claims, use examples, non-generic FAQs, correct performance limitations | Needs targeted changes |
| G5 — discoverability / canonical | Distinct titles/H1/descriptions, link hierarchy, unique main purpose and no accidental canonical/redirect mismatch | Code metadata mostly present; official-domain test pending |
| G6 — competitive evidence | Review dated US Google results, document at least 3 genuine competitors per shortlisted intent, and an actionable advantage (not just keyword matching) | Only spot checks so far; requires SERP verification |
| G7 — production search acceptance | Official domain, crawl access, intended index rules, accurate sitemap, GSC inspection and subsequent 28-day impressions/CTR position data | Not available yet |

**Decision labels:** \`FIX_FIRST\` = technically built and commercially/search-relevant enough to prioritize unique-value work, still hard noindex. \`HOLD\` = keep hard noindex and avoid a standalone SEO release until independent incremental demand/value is demonstrated. No \`INDEX_APPROVED\` decisions were issued.

## Page-by-page review

| URL | Decision | Key finding | Required remediation before another gate |
|---|---|---|---|
| \`/random-number-wheel/1-2/\` | **FIX_FIRST** | Clear two-choice numeric intent, but overlaps the generic number tool and Yes/No wheel; the shared number-page template alone is insufficient. | Add an explicit **1 ↔ option A / 2 ↔ option B** assignment panel, show 50/50 probability, test it independently; do not turn it into another Yes/No page. |
| \`/random-number-wheel/1-8/\` | **FIX_FIRST** | Eight-option wheel matches games / lanes / teams; competitors already offer a ready-made 1–8 spinner. | Add practical eight-seat/team allocation flow with a no-repeat ordered-results view and export; explain exactly when to use it rather than the generic picker. |
| \`/random-number-wheel/1-10/\` | **FIX_FIRST** | Stronger US query family than most range pages, but both direct-answer RNG and wheel intent coexist; some target variations have much higher KD. | Optimize for the exact **1–10 picker** first; offer truly immediate result and clearly labeled visual spin, distinguish from generic number-wheel home, validate SERP result type. |
| \`/random-number-wheel/1-50/\` | **HOLD** | Wheel-focused queries may expect 50 visible candidates, while engine deliberately substitutes a simplified wheel for dense ranges. Existing page text acknowledges the simplification but not all readers may. | Make result/count UI unambiguous, distinguish visual representation from all 50 eligible numbers; investigate whether a generator-first variant is more appropriate before separate indexing. |
| \`/random-number-wheel/1-7/\` | **HOLD** | 7-number page is mostly the same tool as neighboring ranges; "weekly" context is explanatory copy only, with no weekday mapping capability. | Provide a genuine weekday/weekly rotation mapping, locale-specific starting-day choice, no-repeat schedule export; otherwise use the custom range tool. |
| \`/random-number-wheel/1-15/\` | **FIX_FIRST** | A distinct, low-KD historical range query family exists, but content is still nearly identical to other range pages. | Implement a 15-person allocation workflow / ordered numbered draw, with an accessible results table and useful CSV; independent SERP inspection before release. |
| \`/random-number-wheel/1-30/\` | **FIX_FIRST** | Classroom 30-name/number use cases are plausible; baseline page does not offer a roster/attendance assignment workflow. | Add teacher-oriented absent-number selection, draw-without-replacement progress and export of a numbered roll-call order. |
| \`/random-number-wheel/1-200/\` | **HOLD** | Only a small recorded keyword family with weak differentiated need; currently replicates the custom 1–200 number range. | Default to generic number tool via internal links. If persistent US GSC demand and user task emerge, document before adding unique functionality. Evaluate consolidation / future 301; do not canonicalize blindly while noindex. |
| \`/random-number-wheel/1-1000/\` | **FIX_FIRST** | Meaningful estimated query family and batch-sampling use case; competing random-number tools already support much larger batches. | Focus on reproducible presentation of batch selection, clear ordering, no-repeat explanation, 1,000-number eligibility and downloadable results. Verify mobile result and batch limits. |
| \`/random-number-wheel/1-10000/\` | **HOLD** | Only one keyword mapped in the 898-row file; current page is almost entirely the generic 1–10,000 preset. | Keep as a non-indexed utility. Build stronger independent search-intent evidence (not merely KD) before considering a separate landing page. |
| \`/random-letter-wheel/\` | **FIX_FIRST** | Real separate alphabet tool: 26 letters, vowels/consonants, exclusions, case and batch draws. However multiple competitors have rich quick lists and dedicated classroom workflows. | Strengthen concrete classroom/category-game examples, visible odds and exclusions, accessible labels, keyboard use; record true advantage against comparable letter-wheel pages. |
| \`/yes-or-no-wheel/\` | **FIX_FIRST** | Genuine separate two- or three-outcome tool, but leading alternatives include question entry, scoreboards, best-of-N and probability information. | Add question-display field (local only), optional result tally / best-of-three with sound opt-in, preserve genuine 50/50 and 1/3 odds. Avoid claim that the wheel predicts consequential decisions. |
| \`/random-word-wheel/\` | **HOLD** | Separate word/prompt utility, but current curated groups have only 12–16 items; publicly visible competitors offer 100+ selections. US head keyword also has nontrivial KD. | Expand and manually quality-check topic collections, provide grade/word-length/task filters and original educational use cases; revalidate intent before indexing. |

### Prioritization

1. **Release-review cohort, after product work:** \`1-2\`, \`1-8\`, \`1-10\`, \`1-15\`, \`1-30\`, \`1-1000\`, \`random-letter-wheel\`, \`yes-or-no-wheel\`.
2. **Remain noindex:** \`1-7\`, \`1-50\`, \`1-200\`, \`1-10000\`, \`random-word-wheel\`.
3. **No automatic action:** even the priority eight require a *second* review; code completion does not equal authorization to change \`noindex\`.

## Technical and sitewide findings

- The 10 new number pages use the same \`[range].astro\` structure: identical H2/H3 sequence, probability/animation paragraphs and cross-links, with only \`intro\`, \`context\`, \`guide\`, \`tip\`, and numbers changed. This is legitimate shared UI architecture but currently **fails the distinct main-content test** for separate SEO approval. Unique meta titles and descriptions are necessary, not sufficient.
- Candidate numbers carry \`indexApproved:false\` in \`src/data/ranges.ts\`, and the three other candidate tools pass \`noindex={true}\`. \`src/lib/site.ts\` still whitelists only the initial 13 launch routes; \`sitemap.xml.ts\` uses that whitelist.
- \`BaseLayout.astro\` outputs the canonical link only if the global \`INDEXABLE\` switch and a valid \`PUBLIC_SITE_URL\` are set; candidate pages remain noindex. Validate all actual meta/header combinations **on the official domain**, not only in preview.
- Preview \`robots.txt\` currently outputs \`Disallow: /\` when global indexability is disabled. This is intentional for staging, but **Google cannot see a meta noindex if robots.txt forbids crawling that URL**. Once an official domain is enabled, use crawlable per-page noindex for held candidates; do not combine global disallow with an expectation that Google processes the meta directive.
- A \`noindex\` directive is not a general substitute for a considered canonical/redirect decision. If two pages serve effectively the same content, choose whether a genuine independent page should exist. Use a redirect for discarded variants only when a redirect actually preserves user intent.
- Performance and UX require a field check. Existing Chromium/Firefox/WebKit tests cannot prove Search Console performance or real Core Web Vitals.

## Representative external checks (not verified ranking positions)

These are *examples* observed in public search discovery, not a complete regional SERP or claimed top-10 ranking set.

- Number 1–2: https://thespinwheels.com/pick-a-number-1-or-2/
- Number 1–8: https://spinpicker.io/wheel/1-8
- Number 1–10: https://anyfeat.com/number-wheel
- Number 1–50: https://spinpicker.io/wheel/1-50
- Number 1–15: https://spinpicker.site/pick-a-number-1-15.html
- Number 1–30: https://spinpicker.io/wheel/1-30
- Number 1–1000: https://tools.tnaado.ca/random/random-number-1-to-1000/
- High-range numeric alternatives: https://www.random.org/integers/ , https://www.calculatorjunction.com/random-number-generator
- Letter wheel: https://wheelspinning.net/letter-wheel/ , https://spinaname.app/letter-wheel/
- Yes/No: https://wheelspinning.net/yes-or-no-wheel/ , https://yesornoai.com/wheel
- Word wheel: https://yourspinner.com/tools/random-word

Google guidance:
- Scaled content and doorway risk: https://developers.google.com/search/docs/essentials/spam-policies
- Canonical duplicates: https://developers.google.com/search/docs/crawling-indexing/canonicalization
- Noindex + robots crawl caveat: https://developers.google.com/search/docs/crawling-indexing/block-indexing

## Required owner/implementation evidence for the next release review

For **each** \`FIX_FIRST\` candidate: produce before/after UI screenshots at 390px and 1440px, successful unit/interaction tests and a demonstrably useful task-specific workflow; record 3 genuine US SERP comparison URLs, actual distinguishing features, updated metadata, screenshot of page text, and a completed independent reviewer sign-off. After domain setup, inspect the exact URL in GSC and record indexing, impressions, CTR and representative queries after 28 days.

**Current release decision: KEEP ALL 13 CANDIDATES NOINDEX.**
