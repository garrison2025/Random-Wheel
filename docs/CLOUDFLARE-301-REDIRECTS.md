# Number Spinner — Cloudflare 301 Redirect Launch Checklist (2026-11-12)

Official target: **https://numberspinner.com**. The 13 launch URLs, their canonical, `index, follow`, `robots.txt` and `sitemap.xml` already passed live audit. Do not change indexing settings to solve a hostname redirect.

## Required: exactly two hostname redirects

This must be configured at the Cloudflare account level. **Cloudflare Pages `_redirects` does not select redirects by incoming hostname; avoid a wildcard `/*` rule pointing at the same canonical site or it will redirect the canonical host to itself.**

Use **Bulk redirects → Create Bulk Redirect List → Import CSV**, or enter these manually:

```csv
www.numberspinner.com,https://numberspinner.com,301,TRUE,FALSE,TRUE,TRUE
random-wheel-58c.pages.dev,https://numberspinner.com,301,TRUE,FALSE,TRUE,TRUE
```

There is **no CSV header row**. Columns are:
`source_url,target_url,status_code,preserve_query_string,include_subdomains,subpath_matching,preserve_path_suffix`.

- `301` means permanent redirect.
- Both `preserve_query_string` and `subpath_matching` and `preserve_path_suffix` are TRUE, preserving `/random-number-wheel/1-100/?min=1&max=100`.
- **Include subdomains is FALSE** intentionally: deployed preview builds under `*.random-wheel-58c.pages.dev` remain available for QA, while the main production `random-wheel-58c.pages.dev` is redirected. Cloudflare already sends noindex on previews.
- Source values omit the `https://` scheme, matching both HTTP and HTTPS.

**Important:** After importing the list, you must also **create and enable a Bulk Redirect Rule** that uses that list. Merely importing the two rows does not activate redirects. This requires a proxied Cloudflare request.

Official docs:
- https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/create-dashboard/
- https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/reference/csv-file-format/
- https://developers.cloudflare.com/pages/how-to/redirect-to-custom-domain/

## www DNS prerequisite

Live audit currently reports that `www.numberspinner.com` cannot be resolved or fetched. In Cloudflare zone **numberspinner.com → DNS → Records**, check whether a `www` record already exists. If absent, add the **proxied** placeholder A record recommended by Cloudflare:

| Field | Value |
| --- | --- |
| Type | A |
| Name | www |
| IPv4 address | 192.0.2.1 |
| Proxy status | Proxied (orange cloud) |

This is a placeholder *only for redirect interception*, not a website origin IP. **Do not overwrite any existing `www` record** without checking the current routing. For HTTPS, the proxied hostname must have a working Cloudflare certificate.

Official docs: https://developers.cloudflare.com/pages/how-to/www-redirect/

## Verification after enabling

Use GitHub Actions → **Official domain audit** → Run workflow, or run `npm run audit:live`. The audit checks 13 launch URLs, 13 held URLs, canonical, robots, sitemap, 404, and both redirect responses. It should report `failed: 0` to mark URL governance complete. A deployment SHA check ensures the release audit checks the expected build.

Manual spot-check:
```bash
curl -I 'https://www.numberspinner.com/random-number-wheel/1-100/?audit=1'
curl -I 'https://random-wheel-58c.pages.dev/random-number-wheel/1-100/?audit=1'
curl -I 'https://numberspinner.com/robots.txt'
curl -I 'https://numberspinner.com/sitemap.xml'
```

Expected first two: `HTTP 301` and `Location: https://numberspinner.com/random-number-wheel/1-100/?audit=1`. The official domain must continue to return 200 and remain indexable.

`public/_headers` protects the legacy `pages.dev` alias with `X-Robots-Tag: noindex` until the 301 rule is installed; this does not replace the 301 requirement.

No Google Search Console or email send/receive checks are part of this milestone.
