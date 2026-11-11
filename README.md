# WheelCanvas — Free Random Wheel Tools

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

No backend, database, sign-in or paid AI/API is required. The site includes no advertising or analytics scripts.

## Cloudflare Pages

Framework: Astro; build command: npm run build; output directory: dist; Node 22.

Preview and initial build must remain non-indexable. DO NOT enable PUBLIC_INDEXABLE until an actual custom .com domain has been purchased, bound and independently verified, including canonical URL and redirects. Configure PUBLIC_SITE_URL=https://your-actual-domain.com and PUBLIC_INDEXABLE=true for production only. Preview headers / pages.dev and www redirects require separate checks.

## Engineering and SEO accountability

- src/lib/random.ts: secure random primitives, deterministic unit test injection.
- src/data/ranges.ts: independent landing page uses and metadata.
- src/components/Workbench.astro and src/scripts/wheel.ts: browser-only UI.
- docs/RELEASE-GATES.md: engineering Track A and SEO Track B.
- docs/SEO-KEYWORD-MAP.md: sourced first-release keyword plan.

Domain, Cloudflare production deployment, GSC data, indexing and ad approval are NOT confirmed by source code commits.

## V1.5 additions
- 1–100 number results per draw using secure browser randomness, with optional no-repeat selection and exhausted-pool checks.
- Result history export to UTF-8 CSV or plain TXT; escaped spreadsheet formula injection in user-provided values.
- Three wheel animation speed settings saved locally, and securely shuffled custom choices.
- Four P0 candidate range routes (1–2, 1–8, 1–10, 1–50) remain noindex and excluded from the approved sitemap.
- Initial 13 approved routes plus four candidate routes are audited as 17 statically generated pages.
- A private 898-keyword implementation/SEO coverage workbook is delivered outside the public repo; proprietary Semrush data is not committed.

## V1.6 distinct-intent tools

Two new static tools are built but remain explicitly noindex: `/random-letter-wheel/` with English alphabet pools, vowel/consonant filters, exclusions, case and secure batch draws; `/yes-or-no-wheel/` with fair 50/50 or equal-weight Yes/No/Maybe selection. Both retain isolated local saves, share links and results export. The sitemap's original launch whitelist is intentionally unchanged; neither candidate URL is implicitly approved for indexing.
