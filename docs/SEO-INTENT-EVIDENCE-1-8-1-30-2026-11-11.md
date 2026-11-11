# 1–8 / 1–30 — Search-Intent Evidence & Classroom QA Gate

**Date:** 2026-11-11  
**Scope:** \`/random-number-wheel/1-8/\` and \`/random-number-wheel/1-30/\`.  
**Disposition:** Both tools are working and have independent optional classroom workflows, but **neither is authorized for Google indexing**. All thirteen candidates remain hard-noindex.

## 1. What the owner's Semrush export actually supports

Evidence: the owner's deduplicated 898-row *US* keyword export dated **2026-11-09**, classified against the full URL plan in \`Random_Wheel_Keyword_Coverage_V1.7_20261111.xlsx\` (private; intentionally not committed). These are **estimated search volumes and KD**, not WheelCanvas clicks, not keyword rankings and not independent validation of US SERP ranking order.

| Target | Mapped keyword variants | Classroom/team/attendance terms in mapped rows | Representative keyword | US volume/mo estimate | KD |
|---|---:|---:|---|---:|---:|
| 1–8 | 29 | **0** | random number between 1 and 8 | 2,900 | 8 |
| 1–8 | — | — | random number 1-8 | 2,400 | 23 |
| 1–8 | — | — | pick a number 1-8 | 1,900 | 21 |
| 1–30 | 17 | **0** | random number generator 1-30 | 1,900 | 8 |
| 1–30 | — | — | random number 1-30 | 1,000 | 12 |
| 1–30 | — | — | pick a number 1-30 | 880 | 25 |

**Interpretation:** both clusters express *pick/generate a number*. A classroom workflow may create genuine repeat-user value, but the keyword file does **not** demonstrate meaningful search traffic for station assignment or absentee-aware roll call. Do not add the listed volumes: variants overlap in intent, and Semrush estimates do not prove incremental traffic.

**Primary-intent page rule:** the immediate, fair numeric draw must remain visible and usable on first load. Classroom activity is a clear secondary choice with a hero jump link, not a forced intermediate step.

## 2. Public competitor-page checks, not rank verification

- [Real Picker Wheel — classroom group picker](https://www.realpickerwheel.com/education/classroom-group-picker): randomize labels, edit list, export CSV/TXT, eliminate used entries, spin-duration and sound controls. Our station assignment adds a **single allocation table: station number → team**, not just one-at-a-time selection.
- [Spinfetti — random team picker](https://www.spinfetti.com/en/tools/team-picker): generates balanced teams from people. This is a different task from assigning **already defined teams** to eight distinct numbered stations.
- [SpinPicker — class spinner](https://spinpicker.site/class-spinner.html): marks absent students using ~prefix and randomizes names. Our 1–30 roll-call utility offers a 30-number absence-tile control, a pre-shuffled no-repeat order, current/remaining progress and one-step undo.
- [Edform — random name picker](https://edform.com/classroom-tools/random-name-picker): absent marking, repeat exclusion, browser-local list and class utilities, showing that these capabilities are **not novel by themselves**. Our different user journey centers on numeric roll IDs and a called-only vs full-order CSV choice.

These are **public accessible competitor examples**, not an authenticated or geo-controlled Google US top-10. They establish feature availability, not positions, traffic or market share.

## 3. Visual and interaction checks (engineering)

The previous reviewed screenshot set includes:
- \`RandomWheel_1-8_1-30_QA_Styled/station-8-mobile.png\`, \`station-8-desktop.png\`.
- \`RandomWheel_1-8_1-30_QA_Styled/roll-30-mobile.png\`, \`roll-30-desktop.png\`.

Manual screenshot observation:
- Station assignment is readable in mobile 390px; station order presented clearly; long team names should also be manually tested with screen readers and teachers.
- 1–30 mobile 390px absence tiles form a compact 5-column grid; visible current-call text and progress are clear. A clicker/keyboard shortcut is valuable when the teacher is projecting the app; it must never fire while typing an absence list.
- **Privacy/usability improvement:** full-order CSV may reveal forthcoming calls. Add *called-only CSV* distinct from full export, and explicitly label the difference. This is a design safeguard, **not a server security certification**.

Release-specific browser tests now verify keyboard \`N\`/ \`U\` for next/undo, suppress keyboard shortcuts when a text field has focus, correct CSV contents (called-only contains only completed calls), and download/undo/reset states. The existing tests cover 320px/390px phone width, station number uniqueness, 30-number exclusion accuracy, undo and project-screen readiness.

## 4. Remaining evidence required for a responsible index decision

1. Exact mobile/iOS and screen-reader teacher walkthrough (not the same as Playwright or screenshot inspection).
2. A date-stamped **geo-verified Google US** SERP export for at least these six queries: \`random number 1-8\`, \`random number between 1 and 8\`, \`pick a number 1-8\`, \`random number generator 1-30\`, \`random number 1-30\`, \`pick a number 1-30\`. Identify real top-10 tools, whether a Google instant-answer widget occupies the result, and whether the user task is actually solved in Google itself.
3. Only if classroom-intent demand is demonstrated: separate Semrush queries for \`random classroom roll call\`, \`classroom random number picker\`, \`assign teams to stations\`, and \`student number picker\`. Do not pretend those volumes are already in the owner's original list.
4. Official .com domain, accurate canonical and sitemap, Google Search Console inspection, and no accidental index release of other candidate URLs.
5. Distinct main content and fully qualified internal linking after the canonical domain is set. Manual editorial approval for each URL separately.

**Decision:** PRODUCT FUNCTIONAL QA can pass with CI and actual site smoke. INDEXABILITY **remains blocked** until the independent search evidence and official-domain gates are satisfied.

**References:** Google Search Central, [people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) and [spam policy on scaled/doorway pages](https://developers.google.com/search/docs/essentials/spam-policies).
