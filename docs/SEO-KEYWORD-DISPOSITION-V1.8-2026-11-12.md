# WheelCanvas V1.8 — 898-keyword disposition and URL consolidation

**Reviewed:** 2026-11-12 (Asia/Singapore)  
**Original search data:** owner's US Semrush export dated 2026-11-09, 1,000 raw rows deduplicated into **898 unique keywords**. Proprietary keyword rows, Volume and KD remain only in the owner-delivered workbook.  
**Canonical source of row-level decisions:** \`Random_Wheel_898_Keyword_FinalDisposition_V1.8_20261112.xlsx\`, sheets \`KeywordDecision_V1.8\`, \`SEO_Dashboard_V1.8\`, \`UnbuiltRange_17\` and \`CandidateGate_13\` (not committed to public GitHub).  
**Authority:** product/SEO planning decisions, **not verified US Google rankings or site search volume**.

## Counted decisions (898, no double counting)

| Final disposition | Keyword rows | Concrete action |
|---|---:|---|
| KEEP_CORE | 531 | Use one of eight original indexed-candidate tool URLs; only the official-domain release can enable indexability |
| KEEP_CANDIDATE_NOIDX | 235 | Candidate tool exists but is hard noindex and excluded from approved sitemap |
| MERGE_GENERIC_PRESET | 56 | Use the existing number tool with validated query \`?min=1&max=N\`; **no new HTML/indexable page** |
| MERGE_CORE | 22 | One of the existing core URLs satisfies the useful task; do not create a synonym landing page |
| MERGE_HELD | 14 | Task fits an existing noindex candidate; do not approve it for search until independent review |
| HOLD_QUERY_UNVERIFIED | 19 | Ambiguous or potentially unrelated intent; exclude from current SEO targets pending date-stamped US SERP checks |
| EXCLUDE_OR_DEFER | 16 | Fraction, foreign-language, mathematical or otherwise out-of-scope meaning; no ranking targets |
| EXCLUDE_BRAND | 5 | Third-party branded navigation should not be claimed as a target for this tool |
| **TOTAL** | **898** | Every row has an explicit implementation/SEO action |

These counts **supersede** the older planning counts \`535/236/55/72\`. The older counts described page implementation groupings, not final search-intent disposition. The 5 brand terms are excluded from earlier tool assignments. 55 planned-but-unbuilt rows are consolidated with one additional ambiguous expression served by the generic parameter URL, totaling **56** query-presets.

## Seventeen out-of-plan numeric URLs are NOT to be generated

Previously proposed 1–9, 1–14, 1–12, 1–16, 1–11, 1–75, 1–60, 1–13, 1–40, 1–80, 1–70, 1–25, 1–19, 1–90, 1–22, 1–69 and 1–18 **are not standalone pages**. All their intended values fit inside the original \`/random-number-wheel/\` generator.

Examples (functional links, not new SEO URLs):
- \`/random-number-wheel/?min=1&max=9\`
- \`/random-number-wheel/?min=1&max=14\`
- \`/random-number-wheel/?min=1&max=75\`

The client validates \`1 <= min <= max <= 10000\`, accepts exactly one min and max, and refuses duplicate/invalid fields. Explicit URL range presets override saved *generic* tool settings for that visit, without overwriting saved settings. Share-fragment configurations take precedence. **Canonical remains the static \`/random-number-wheel/\`**; query permutations must not be added to \`LAUNCH_ROUTES\`, separate sitemap entries, or new \`[range].astro\` static paths.

## Thirteen candidate URLs: explicit index decision

- **2 promising, NOT approved:** \`/random-number-wheel/1-8/\`, \`/random-number-wheel/1-30/\`. Distinct allocation/roll-call workflows are built, but the owner's 29 and 17 mapped keyword rows respectively are mostly random-number generator intent rather than classroom workflow intent. Needs actual US SERP, classroom usability, and official-domain SEO evidence.
- **6 require more differentiation, still noindex:** \`1-2\`, \`1-10\`, \`1-15\`, \`1-1000\`, \`random-letter-wheel\`, \`yes-or-no-wheel\`.
- **5 held, still noindex:** \`1-7\`, \`1-50\`, \`1-200\`, \`1-10000\`, \`random-word-wheel\`. Keep them useful for visitors but do not treat as standalone Google search pages until a new independent user-value case emerges.

**Do not automatically redirect existing candidate pages.** They currently serve working tools and might receive direct/user-shared links. A future merge/301 requires separate evidence about user intent, links, traffic and official domain.

## Launch/verification gates (not complete)

1. Buy/bind official \`.com\` domain, declare \`PUBLIC_SITE_URL\` (HTTPS) and \`PUBLIC_INDEXABLE\` only after verifying domain routing and intended canonical.
2. Verify main 8 tool URLs and 5 support URLs separately; static sitemap and robots.txt must match exact launch whitelist, and preview \`pages.dev\` must not become a duplicate indexed domain.
3. Re-check all 13 hard-noindex candidates on the official domain. The current \`pages.dev\` global robots disallow is a staging choice, not a production indexing method.
4. Validate real US Google SERPs for the 2 candidates and the 19 ambiguous keyword intents. The current workbook's "hold" is a **deliberate actionable decision**, not a false claim that the SERP was verified.
5. Inspect URL coverage and query data in Search Console and use 28-day data to decide which candidate SEO URLs deserve an indexability change. Nothing in this file authorizes index release.
6. Preserve private source keyword metrics outside the public repository and never infer ranking/SEO traffic from estimates.

## Google policy references

- URL structures and overproduction of similar parameter URLs: https://developers.google.com/search/docs/crawling-indexing/url-structure
- Canonicalization and duplicate consolidation: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Scaled content and doorway spam policies: https://developers.google.com/search/docs/essentials/spam-policies

**V1.8 release status: keyword disposition complete; engineering shortcut pending CI/deployment; Google SEO launch NOT complete.**
