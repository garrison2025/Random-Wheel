# Number Spinner — GEO / AI-search readiness, 2026-11-12

Scope: NumberSpinner.com, eight approved tool entry URLs, five approved support pages, and thirteen **held/noindex** candidates. This is a free SEO traffic website, not SaaS. GEO here means supporting accurate discovery, retrieval, understanding and citation in AI-powered search, **not** geo-location optimization.

## Why this implementation (verified public guidance)

- Google AI Overviews / AI Mode use the core Google Search indexing and ranking systems. Google says no special schema, AI-only file or artificial content "chunking" is required; indexability, useful text, links and content quality remain paramount: https://developers.google.com/search/docs/appearance/ai-features and https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- OpenAI describes **OAI-SearchBot** as the crawler for ChatGPT Search and distinguishes this from **GPTBot** (model training). `User-agent: * / Allow: /` already permits legitimate search bots on the official production site; adding individual "Allow" rules is not a ranking trick. Cloudflare security policy and real crawler access still require independent monitoring: https://developers.openai.com/api/docs/bots
- Bing Webmaster Tools' AI Performance report can show Copilot/Bing citation counts, cited pages, and grouped grounding queries, *if the user verifies and connects their site*. Counts are not rankings or traffic, and their absence does not prove an error: https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c
- FAQ rich results are heavily restricted on Google and are not a valid generic GEO performance promise: https://developers.google.com/search/blog/2023/08/howto-faq-changes

## What was changed

1. **Eight approved interactive entry pages** show concise, user-readable, route-specific facts: what it does, draw mechanics, duplicate/exclusion rules, and privacy. Content is generated from a single verified fact model `src/lib/geo-tool-facts.ts`, rendered in `GeoToolSummary.astro` next to real tools, with deliberate links to methodology.
2. **WebApplication structured data** is generated only for the eight official/indexable tool pages. Descriptions, URLs and visible entity names must agree. Only observed features and `isAccessibleForFree:true` are declared. No invented users, ratings, endorsements, awards or reviews. Existing homepage `WebSite` and verified number-page `BreadcrumbList` schema are preserved.
3. **Trust & methodology** at `/about/#how-results-are-generated`: browser Web Crypto and rejection sampling, selection vs animation, independent 1/N probabilities, weighted entries, no-replacement batches, privacy of sharing and storage, regulatory limitations. Links to inspectable repository source and MDN.
4. **Citable selection guide** at `/tools/#choose-picker`: a real comparison table for names/choices, quick 1–100, dice-style 1–6, classroom 1–20 and custom-range tools, rather than generic SEO copy. Mobile scroll area prevents document overflow.
5. **Safety checks**: build-time GEO audit verifies visibility, URLs, truthful JSON-LD, methodology link, and keeps the held pages noindex without additional WebApplication schema; unit and browser tests cover the visible content.
6. **Existing indexing preserved**: 13 approved routes, 13 held candidates, official-domain Canonical/robots/sitemap. This work does **not** unlock the held pages.

## What was *not* done

- No `llms.txt` or speculative "AI crawler sitemap" was created: it is not a Google AI Search requirement or a substitute for visible HTML, indexing and quality.
- No `FAQPage` rich-result spam, structured ratings, synthetic testimonials, fake citations, made-up case studies or fake authors.
- No AI API, database, analytics vendor, paid service or new keyword pages were added.
- No claim of guaranteed AI answers, rankings, citations or actual GEO-driven visits.

## Production validation protocol

- `npm run check`, `npm test`, `npm run build` (postbuild audit), `npm run test:e2e`; inspect latest GitHub Actions commit SHA, not a previous success.
- Check official homepage JSON-LD: exactly one `WebSite` and one `WebApplication`; every approved interactive tool page exactly one `WebApplication` with a matching self URL. Held candidate pages must not get that schema.
- Check `/about/#how-results-are-generated` source links, `/tools/#choose-picker` mobile table, eight tool fact modules, and page performance.
- Check production `robots.txt` allows search crawler requests, `sitemap.xml` still contains exactly 13 approved URLs, canonical and robots unchanged.
- Optional real-world measurement later: Google Search Console index/AI search visibility (where available), Bing AI Performance citing pages and grounding queries, actual referrer data (recognizing AI citations do not equal clicks), and manual examples of answers where Number Spinner is cited. Never report manual prompting as unbiased ranking data.

## GEO priority after launch

Prioritize accuracy and clarity when a feature changes. When new tool ranges receive independent approval, update the fact model, route whitelist and tests **only after** page-level quality review. For AI engines, the most relevant improvement will be real linkability and demonstrated usefulness, not repeated permutations of numeric pages.
