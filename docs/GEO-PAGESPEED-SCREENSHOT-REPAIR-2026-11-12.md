# Number Spinner — screenshot-based GEO and PageSpeed repair, 2026-11-12

## Evidence-based diagnosis

The submitted third-party GEO checker screenshot reported **73/100** and suggestions about AI search bots, assistant fetchers, llms.txt, sitemap reference, entity/author/date attributes, citations and lists. This score is **not** a Google or OpenAI ranking signal. We fixed the actionable presentation and code issues without manufacturing authority or opening held URLs.

The submitted Google PageSpeed Insights screenshot said it could not resolve `https://numberspinner.com/`. We independently checked:

- GitHub Actions crawler diagnostic: production homepage and robots.txt returned **HTTP 200** for a normal client and simulated Googlebot, OAI-SearchBot, Claude-SearchBot and PerplexityBot user agents; no `cf-mitigated` challenge header was reported. User-Agent impersonation cannot prove access from the genuine published bot IPs.
- Google Public DNS-over-HTTPS reported **rcode 0** with both A and AAAA answers for the apex domain.
- The public Google PageSpeed API returned **HTTP 429 RESOURCE_EXHAUSTED**, specifically a shared project daily query quota error; that API response cannot supply a performance score or demonstrate a site-side DNS error.
- A separate real Chrome/Lighthouse CLI run **successfully loaded** `https://numberspinner.com/` and reported performance 97, accessibility 93, best practices 100, SEO 100; FCP 1.0s, LCP 2.7s, CLS 0, TBT 0ms. This is a **single lab result**, not Google's PSI service, CrUX field data or a guarantee of future scores.
- Snapshot evidence: https://github.com/garrison2025/Random-Wheel/actions/runs/43185616760 (crawler/DNS/PSI diagnostic) and https://github.com/garrison2025/Random-Wheel/actions/runs/43185952546 (independent Lighthouse audit).

## Code and content changes

- Explicit `Allow: /` sections for recognized search and assistant bots in **production** robots.txt, plus preserved general allow + official sitemap. The preview's disallow rule is unchanged.
- Added an optional, accurate `/llms.txt` with only eight approved tool URLs, methodology, privacy and contact; not a Google indexing requirement.
- Schema: homepage WebSite brand identity points to the actual GitHub code project. The eight approved WebApplication tool entities link to that same repository and declare the real project-level maintainer, not a fabricated person.
- About: visible project attribution and methodology review date; valid TechArticle with project-level author and dateModified; linked MDN/W3C specifications and public source code.
- Home page: numbered steps, real capabilities list, readable technical citations and limitations.
- Build, browser and HTTP audits now guard the new fields and keep 13 held candidates noindex.

## Deliberately avoided

- Artificial external quotes, author biographies, social profiles, certificates, stars, reviews or AI-ranking guarantees.
- Changing the agreed 13-index/13-held page gate.
- Claiming third-party GEO score 73 will increase to a particular number. Re-run the same third-party scanner after deployment to compare.
- Disabling Cloudflare security protections without evidence. Cloudflare can prepend managed robots rules or block genuine verified bots independently of origin code. If verified crawler IPs actually show 403/challenges, inspect **Cloudflare > Security > Bots / AI bots / Managed robots.txt** and HTTP request logs before adjusting rules.
- Upgrading domains, paying for services, or changing deferred www/pages.dev 301s.

## Follow-up verification

1. Open `https://numberspinner.com/robots.txt` and confirm `Sitemap: https://numberspinner.com/sitemap.xml`.
2. Open `https://numberspinner.com/sitemap.xml` and confirm it contains only the 13 approved canonical URLs.
3. Open `https://numberspinner.com/llms.txt` and `https://numberspinner.com/about/`; confirm source references and review date.
4. Re-run the original GEO checker **after** Cloudflare serves the latest commit. Its crawler checks may use a different IP/UA and can still disagree.
5. Re-run PageSpeed Insights at a later moment. If the UI still fails, inspect an exact PSI API response or use the Lighthouse JSON artifact; avoid equating a transient PSI service error with a DNS configuration error.

## Primary technical sources

- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- https://developers.openai.com/api/docs/bots
- https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
- https://developers.cloudflare.com/bots/additional-configurations/custom-rules/
- https://developers.google.com/speed/docs/insights/v5/get-started
