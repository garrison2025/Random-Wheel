# Number Spinner — Free Random Wheel Tools

Astro + TypeScript free browser-based random wheel. Implements the Random Wheel V1.2 engineering and SEO validation plan.

## Initial scope

Twelve tool routes: home (custom choice wheel), random-number-wheel, six original range presets, and four additional P0 candidates (1–2, 1–8, 1–10, 1–50). Four new candidates are noindex pending review; five support pages are also available.

Features: Quick Pick, Spin Wheel, secure rejection sampling, integer weights, number exclusions and steps, no-repeat drawing, history, local storage, share links CSV/text import, securely shuffled entries, configurable spin duration, multi-number batch drawing (1–100), and CSV/TXT result downloads.

## Developer commands

Node.js 22 recommended.

    npm install
    npm run dev
    npm run check
    npm test
    npm run build
    node scripts/audit-pages.mjs
    npx playwright install chromium
    npm run test:e2e
    npm run audit:live   # after the official domain is live

No backend, database, sign-in or paid AI/API is required. The site includes no advertising or analytics scripts.

## Cloudflare Pages: numberspinner.com

Framework: Astro; build command: `npm run build`; output directory: `dist`; Node.js 22.

The user has purchased `numberspinner.com`, provided `contact@numberspinner.com` and connected the domain to Cloudflare. **We have not independently verified that the domain is Active under the Pages project's Custom domains tab, serving HTTPS, or redirecting alternatives.**

Official canonical origin: `https://numberspinner.com` (no `www`). `PUBLIC_SITE_URL` is optional because the source defaults to that exact origin. All 13 approved URLs emit a self-canonical in every build. On Cloudflare Pages production (`CF_PAGES=1`, `CF_PAGES_BRANCH=main`) those approved URLs become indexable automatically, with no manual `PUBLIC_INDEXABLE=true` required; preview branches stay `noindex` by default. An explicitly configured `PUBLIC_INDEXABLE=false` overrides automatic indexing, and must be cleared to open approved production URLs. The other 13 candidate URLs stay `noindex` and outside the sitemap regardless. Verify production HTML and robots after deployment.

The main `<project>.pages.dev` production alias must use a host-level 301 redirect to the official domain, retaining path and query. Independently 301 `www.numberspinner.com` to the apex. Those cannot be proven or achieved by publishing identical static HTML to multiple hosts. Follow `docs/OFFICIAL-DOMAIN-LAUNCH-2026-11-12.md` and audit the live responses before submitting the Sitemap to Google Search Console.

## Engineering and SEO accountability

- src/lib/random.ts: secure random primitives, deterministic unit test injection.
- src/data/ranges.ts: independent landing page uses and metadata.
- src/components/Workbench.astro and src/scripts/wheel.ts: browser-only UI.
- docs/RELEASE-GATES.md: engineering Track A and SEO Track B.
- docs/SEO-KEYWORD-MAP.md: sourced first-release keyword plan.

Domain ownership and the provided contact email are user-reported. Pages custom-domain activation, Cloudflare production deployment, GSC data, indexing and ad approval are NOT confirmed by source code commits.

## V1.5 additions
- 1–100 number results per draw using secure browser randomness, with optional no-repeat selection and exhausted-pool checks.
- Result history export to UTF-8 CSV or plain TXT; escaped spreadsheet formula injection in user-provided values.
- Three wheel animation speed settings saved locally, and securely shuffled custom choices.
- Four P0 candidate range routes (1–2, 1–8, 1–10, 1–50) remain noindex and excluded from the approved sitemap.
- Initial 13 approved routes plus four candidate routes are audited as 17 statically generated pages.
- A private 898-keyword implementation/SEO coverage workbook is delivered outside the public repo; proprietary Semrush data is not committed.

## V1.6 distinct-intent tools

Two new static tools are built but remain explicitly noindex: `/random-letter-wheel/` with English alphabet pools, vowel/consonant filters, exclusions, case and secure batch draws; `/yes-or-no-wheel/` with fair 50/50 or equal-weight Yes/No/Maybe selection. Both retain isolated local saves, share links and results export. The sitemap's original launch whitelist is intentionally unchanged; neither candidate URL is implicitly approved for indexing.


## V1.7 — remaining planned tool routes

The repository now builds all 26 original planned HTML routes: 21 tool routes and 5 support pages. The new Random Word Wheel offers five curated English word lists, custom weighted word lists, TXT/CSV import, batch selection and local setup saving. Six additional number-range presets (1–7, 1–15, 1–30, 1–200, 1–1000, 1–10000) complete the original planning matrix.

**Index policy is deliberately unchanged:** only the original 13 launch routes can appear in the sitemap with a verified official domain and indexability opt-in. Thirteen candidate routes remain hard-noindex until manually reviewed; the mere presence of a URL in code is not SEO approval. All new tools are served as static Astro pages, with no database or paid third-party dependency.


## SEO candidate remediation

Priority candidate tools now include distinct workflow experiences: binary option mapping (1–2), eight-station allocation (1–8), instant/complete ordering (1–10), named presentation roster (1–15), absence-aware progressive roll call (1–30), large batch sampling (1–1000), classroom letter challenges, and Yes/No question + tally/best-of-three. Source-level completion **does not** authorize indexing. All 13 candidate pages continue returning \`noindex\`; review \`docs/SEO-REMEDIATION-2026-11-11.md\` before changing the release gate.
