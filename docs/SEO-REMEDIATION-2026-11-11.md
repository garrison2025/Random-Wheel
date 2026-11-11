# Candidate SEO remediation — implementation checklist

**Date:** 2026-11-11. **Scope:** eight priority candidates identified in \`SEO-CANDIDATE-AUDIT-2026-11-11.md\`.  
**Classification:** Product/UX remediation completed in source only; **SEO indexing approval remains pending**.  
**Baseline:** \`3f89283\`. **Candidate noindex remains mandatory** until independent SERP/value review and production-domain evidence.

## Concrete improvements

| Candidate URL | New, specific workflow | New tests / acceptance | Outstanding before SEO index approval |
|---|---|---|---|
| /random-number-wheel/1-2/ | Editable numbered Option A/B labels, secure 50/50 selection, exported mapping | Exact number and chosen label, duplicate-label rejection, CSV download | US SERP: determine whether binary name mapping adds value beyond existing Yes/No and 1–2 competitors |
| /random-number-wheel/1-8/ | 1–8 unique station assignments for up to eight named teams | No reused station, distinguish group names, exported pairings | Compare against three real stations/team-allocation results; teacher feedback |
| /random-number-wheel/1-10/ | One-action instant picker plus independently shuffled complete ten-number order | Result 1–10, order covers each number exactly once | Check direct-answer vs wheel search intent and SERP features |
| /random-number-wheel/1-15/ | Named student presentation order, duplicate-name rejection, CSV | Up to 15 distinct participants, shuffled sequence | Classroom usability validation and comparison with attendance/roster apps |
| /random-number-wheel/1-30/ | Absence exclusion plus progressive roll-call steps and CSV | Absent values never called; 27 present for 3 excluded; next action advances | Validate common absence/roll-call search intent vs pure numeric picker query |
| /random-number-wheel/1-1000/ | 1–100 secure batch sample, deduplication/exclusions, summary, export | 80 samples with no duplicates; excluded 11 and 99 absent; 101 rejected | Compare against established RNG batch utilities, audit export performance |
| /random-letter-wheel/ | Practical classroom letter prompt using chosen wheel result + 60-second optional timer | Challenge matches chosen letter and topic; timer start/stop | Real classroom workflow check, accessibility and mobile usability |
| /yes-or-no-wheel/ | Local question display, Yes/No/Maybe tally, optional three independent rounds | Question visible, counts total three, further pick disabled, reset | Competitor feature/SERP check; clarify this is not advice |

The new number-task flows use shared **secure cryptographic randomness**, an accessible dedicated result view, UTF-8 CSV export with formula-safe cell escaping, and no API/server account requirements. The main wheel remains independently usable on each page.

## Safety, content and index gates

- Do not mark \`FIX_FIRST\` as \`INDEX_APPROVED\` on the strength of implementation alone.
- Five held pages remain unchanged: \`1-7\`, \`1-50\`, \`1-200\`, \`1-10000\`, \`random-word-wheel\`.
- The entire number candidate group still shares a basic page wrapper, but six reviewed candidates now have independent task interaction and specific on-page instructions. Distinctness must be judged on rendered user value, not code architecture alone.
- A complete current US Google SERP top-10 comparison for all eight, at least three comparable results per intent, verified GSC setup, live official canonical checks, and editorial approval are **not yet done**.
- Original \`LAUNCH_ROUTES\` remains unchanged; all 13 candidates stay \`noindex\` even when global indexing is enabled.
- The separate 898-keyword workbook is not committed to public GitHub.

## Verification

Source test file: \`tests/seo-remediation.e2e.spec.ts\`; common browser regressions extended in \`tests/crossbrowser.e2e.spec.ts\`; secure helpers unit-tested in \`tests/seo-workflows.test.ts\`. The CI state must be read from GitHub Actions after this commit, rather than presumed successful from source changes.

**Current release state:** FUNCTIONAL REMEDIATION SUBMITTED; INDEXING DECISION STILL ON HOLD.
