# WheelCanvas — Free Random Wheel Tools

Astro + TypeScript free browser-based random wheel. Implements the Random Wheel V1.2 engineering and SEO validation plan.

## Initial scope

Eight tool routes: home (custom choice wheel), random-number-wheel, and six range presets (1–3, 1–4, 1–5, 1–6, 1–20, 1–100); plus five supporting pages.

Features: Quick Pick, Spin Wheel, secure rejection sampling, integer weights, number exclusions and steps, no-repeat drawing, history, local storage, share links and CSV/text import.

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
