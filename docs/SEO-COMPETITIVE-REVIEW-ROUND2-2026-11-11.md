# Random Wheel — SEO Competition Reassessment (Round 2)

**Review date:** 2026-11-11  
**Site:** https://random-wheel-58c.pages.dev/  
**Owner data:** US Semrush keyword export, snapshot 2026-11-09 (private; numbers are estimates).  
**Reviewed code:** `e58d5ef`, plus this change set for release-gate and Yes/No scoring corrections.  
**Search evidence:** live/public page discovery and source-page feature inspection. **Not** an authenticated, geographically controlled US Google top-10 ranking export. Listed competitors are real accessible examples; listing order here is **not a claim of ranking order**.  
**Index decision:** **ZERO newly index-approved URLs.** Keep all thirteen candidate routes `noindex`.

## Executive decision

| Decision | Count | Paths | Meaning |
|---|---:|---|---|
| PROMISING_NOT_APPROVED | 2 | `1-8`, `1-30` | The new task workflow is demonstrably different and merits final review, but not automatic indexing |
| FIX_FIRST | 6 | `1-2`, `1-10`, `1-15`, `1-1000`, `random-letter-wheel`, `yes-or-no-wheel` | Competing products already meet some or most functions, or the main query intent is not yet well served |
| HOLD | 5 | `1-7`, `1-50`, `1-200`, `1-10000`, `random-word-wheel` | No new evidence that standalone indexable pages add enough incremental search/user value |

**No rank-claim, impression-claim, traffic-claim or indexing-success-claim is authorized by this review.** The previous code tests establish functionality, not Google Search market success.

## Comparative findings, with three concrete competitor pages per priority candidate

### 1. /random-number-wheel/1-2/ — FIX_FIRST

**Query:** `pick a number 1-2`.  
**Our live workflow:** label two numbered choices, sample one number with a secure 50/50 draw, export exact choice/number mapping.  
**References:** [TheSpinWheels 1-or-2](https://thespinwheels.com/pick-a-number-1-or-2/), [NamesOnWheel 1-or-2](https://namesonwheel.com/pick-a-number-1-or-2-wheel/), [WheelSpinnerTool directory](https://wheelspinnertool.com/wheels/).  
**What the competition already does:** ready-made two-slice wheel, editable entries, visual reveal and setup-sharing. TheSpinWheels explicitly recommends mapping 1/2 to real choices before the spin.  
**Differentiation:** our explicit label-to-number table plus CSV record avoids ambiguity, but it is a narrow increment.  
**Release blocker:** demonstrate immediate 1/2 result and the attached label without scrolling into a second workflow; check whether generic SERP intent is satisfied by the direct answer.

### 2. /random-number-wheel/1-8/ — PROMISING_NOT_APPROVED

**Query:** `random number 1-8`.  
**Our workflow:** assign up to eight unique team names to distinct stations 1–8 and export a stable pairing list; ordinary eight-number spinner remains on the page.  
**References:** [SpinPicker 1–8](https://spinpicker.io/wheel/1-8), [SpinTheWheel 1–8](https://spinthewheel.io/random-number-1-8), [Wordineer 1–8 RNG](https://wordineer.com/random-number-1-8).  
**Competitor features:** equal-chance wheel with deletion/history, or RNG with pool/exclude mode.  
**Potential advantage:** the one-click *team-to-unique-station allocation table* is distinct from merely displaying eight random values. This is a meaningful separate task, although no externally measured adoption is available.  
**Pre-index gate:** keep the instant draw prominent; test allocation with actual teacher/coach tasks and verify that US search users want allocations rather than just a digital d8.

### 3. /random-number-wheel/1-10/ — FIX_FIRST

**Query:** `pick a number 1-10`.  
**Our workflow:** immediate result and complete no-repeat ordering of all ten numbers.  
**References:** [SpinPicker 1–10](https://spinpicker.io/wheel/1-10), [WheelPickerApp 1–10](https://wheelpickerapp.com/random-number-1-10), [Spin a Name number wheel](https://spinaname.app/random-number-wheel/).  
**Competitor features:** ready 1–10 wheels, quick pick, elimination and generic range editing.  
**Gap:** users may accept Google quick answers or established pickers; our full-order option is useful but not clearly dominant.  
**Pre-index gate:** show the value of generating the entire order in a dedicated view, validate precise query variations and avoid cannibalizing the parent range tool.

### 4. /random-number-wheel/1-15/ — FIX_FIRST

**Query:** `random number 1-15`.  
**Our workflow:** up to 15 participant names shuffled into a unique presentation/call order with CSV export.  
**References:** [SpinPicker 1–15](https://spinpicker.site/pick-a-number-1-15.html), [Calculife 1–15](https://calculife.com/random-number-generator-1-15/), [WheelPicky random-number generator](https://wheelpicky.com/random-number-generator/).  
**Competitor features:** simple instant result, variable draw count, visual number-wheel response.  
**Gap:** the roster workflow is differentiated but may be **different from the primary one-number query intent**. The page must not bury the immediate numeric answer under the roster.  
**Pre-index gate:** verify that the roster component improves the user journey for 1–15 queries, rather than requiring an unrelated task; research long-tail named-order intent separately.

### 5. /random-number-wheel/1-30/ — PROMISING_NOT_APPROVED

**Query:** `random number 1-30`.  
**Our workflow:** exclude absent numbered students, generate a private shuffled order, reveal one student at a time, and export the full order.  
**References:** [SpinPicker 1–30](https://spinpicker.io/wheel/1-30), [Peabody Teach 1–30](https://teach.peabody.kids/wheel/numbers-1-30), [NamesOnWheel 1–30](https://namesonwheel.com/pick-a-number-1-30-wheel/).  
**Competitor features:** 30-number spinning wheel, elimination; Peabody explicitly supports absence marks and teacher use.  
**Potential advantage:** our *generated complete future order + progressive current-call display + CSV* is distinct from only excluding absences during repeated wheel spins.  
**Pre-index gate:** obtain real teacher usability feedback, confirm 320px/mobile layout and clear present/remaining states, and consider explicit output handling for personal information.

### 6. /random-number-wheel/1-1000/ — FIX_FIRST

**Query:** `random number generator 1-1000`.  
**Our workflow:** secure, no-repeat batch selection (1–100 at a time), optional exclusions and CSV of results.  
**References:** [TNAADO 1–1000](https://tools.tnaado.ca/random/random-number-1-to-1000/), [WheelPickerApp 1–1000](https://wheelpickerapp.com/random-number-1-1000), [SpinTheWheel 1–1000](https://spinthewheel.io/random-number-1-1000).  
**Competitor features:** immediate number and batch selection; TNAADO publicly advertises up to 10,000 draws per batch.  
**Gap:** our 100-result cap has a clear functionality ceiling for dataset sampling.  
**Pre-index gate:** improve downloadable sample-order workflow and the number of supported unique samples (within safe/browser performance limits), differentiate from existing generators and confirm demand for the wheel style.

### 7. /random-letter-wheel/ — FIX_FIRST

**Query:** `random letter wheel`.  
**Our workflow:** 26-letter wheel, presets, exclusions, uppercase/lowercase, classroom category prompt and 60-second timer.  
**References:** [WheelSpinning letter tool](https://wheelspinning.net/letter-wheel/), [SpinnWheel letter spinner](https://spinnwheel.com/letter-spinner), [Spin a Name letter wheel](https://spinaname.app/letter-wheel/).  
**Competitor features:** alphabet/vowel/consonant lists, elimination, category game and (at least one of these examples) full category scoring and timer.  
**Gap:** the 60-second prompt is **not unique**.  
**Pre-index gate:** create a truly usable classroom round with multiple categories, optionally vowel/consonant pairs, and accessible keyboard control; validate that these improve repeated use rather than adding decorative controls.

### 8. /yes-or-no-wheel/ — FIX_FIRST

**Query:** `yes and no wheel`.  
**Our workflow:** Yes/No or Maybe, question displayed locally, tally, optional best-of-three.  
**References:** [WheelSpinning Yes/No](https://wheelspinning.net/yes-or-no-wheel/), [YesOrNoAI](https://yesornoai.com/wheel), [FreeLuckyWheel Yes/No](https://freeluckywheel.com/en/yes-or-no-wheel).  
**Competitor features:** question entry, Maybe mode, scoreboards, best-of-three; these features already exist in public pages.  
**Gap:** feature parity is not a competitive advantage; the initial local “best of three” implementation was actually three obligatory spins, rather than first to two for binary mode.  
**Remediation included in this revision:** correct binary first-to-two behavior with reproducible unit tests; three-option mode explicitly displays three draws / plurality and may tie. This **fixes accuracy**, not competitiveness.  
**Pre-index gate:** compare visual quality, loading speed, accessibility, clarity of odds and repeat-user tasks, and find a measurable improvement before approving a standalone SEO landing page.

## Five candidates kept on hold

- `/random-number-wheel/1-7/`: currently seven-number selection plus textual weekday examples; no real schedule-to-day assignment.
- `/random-number-wheel/1-50/`: simplified visual wheel for 50-number set; little independent functionality.
- `/random-number-wheel/1-200/`: small recorded keyword family; generic picker already covers range.
- `/random-number-wheel/1-10000/`: essentially the same generic 1–10,000 tool with only a different preset.
- `/random-word-wheel/`: short curated word lists; independent educational filtering/grade/task use not yet developed.

All five remain useful **accessible utilities** despite being noindex: free sites need not charge. The SEO decision is whether these **deserve a separate indexable landing page**, not whether a free product can make money.

## Technical verification and remaining gates

- Candidate noindex was independently checked on all 13 URLs after the previous functional remediation. Those observations are not GSC indexing evidence.
- Canonical should be emitted **only for index-eligible pages**; this revision updates the shared layout policy accordingly and adds a locked-down check against all thirteen candidates.
- Production-domain Googlebot crawling, the intended sitemap and canonical response, Search Console verification, and proper US SERP capture are still unavailable. The current `pages.dev` preview is intentionally blocked globally via robots.txt while production indexing is disabled.
- Public-web search discovery does **not** prove that any cited competitor currently appears in US Google positions 1–10. Do not cite this report as a ranked-SERP screenshot.
- No candidate is allowed into `LAUNCH_ROUTES` until it separately passes the official-domain, query-intent, usability/accessibility, metadata, and editorial release gates.

**Final Round-2 verdict: two promising review candidates, six needing further differentiation, five on hold; zero indexed candidates approved.**

## Sources (public accessible feature descriptions, not ranking proof)

Google official guidance:  
- https://developers.google.com/search/docs/essentials/spam-policies  
- https://developers.google.com/search/docs/crawling-indexing/block-indexing  
- https://developers.google.com/search/docs/essentials/technical

All 24 specific competitor URLs and individual decisions are recorded in `docs/seo-competitor-gates.json`; the private keyword volume/KD export remains outside the public repository.
