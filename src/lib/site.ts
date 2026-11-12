export const SITE_NAME = 'Number Spinner';
export const CONTACT_EMAIL = 'contact@numberspinner.com';
export const OFFICIAL_ORIGIN = 'https://numberspinner.com';
export const DOMAIN = (import.meta.env.PUBLIC_SITE_URL || OFFICIAL_ORIGIN).replace(/\/+$/, '');

// Only the official HTTPS domain can be indexed. A Pages main production build
// is indexable by default; previews are noindex unless explicitly overridden.
export function isOfficialIndexDomain(candidate: string): boolean {
  // Refuse an accidentally configured legacy domain, subdomain, or Pages preview.
  if (candidate !== OFFICIAL_ORIGIN) return false;
  try {
    const url = new URL(candidate);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== 'https:' || url.origin !== candidate) return false;
    if (!/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(host) || host.includes('..')) return false;
    if (host === 'pages.dev' || host.endsWith('.pages.dev')) return false;
    if (/(^|\.)example\./i.test(host)) return false;
    return true;
  } catch {
    return false;
  }
}
/**
 * The official Cloudflare Pages main build must never ship a noindex homepage.
 * Its production-branch identity takes precedence over a stale legacy
 * PUBLIC_INDEXABLE=false setting in Cloudflare's environment.
 * Non-main Pages previews always remain protected. Local/CI builds still
 * default to noindex unless explicitly testing a production configuration.
 */
export function shouldIndexApprovedPages(
  domain: string,
  setting: string | undefined,
  pages: string | undefined,
  branch: string | undefined
): boolean {
  if (!isOfficialIndexDomain(domain)) return false;
  if (pages === '1' && branch === 'main') return true;
  if (pages === '1' && branch !== 'main') return false;
  return setting === 'true';
}

export const INDEXABLE = shouldIndexApprovedPages(
  DOMAIN,
  import.meta.env.PUBLIC_INDEXABLE,
  process.env.CF_PAGES,
  process.env.CF_PAGES_BRANCH
);

export const LAUNCH_ROUTES = [
  '/', '/random-number-wheel/', '/random-number-wheel/1-3/', '/random-number-wheel/1-4/',
  '/random-number-wheel/1-5/', '/random-number-wheel/1-6/', '/random-number-wheel/1-20/',
  '/random-number-wheel/1-100/', '/tools/', '/about/', '/privacy/', '/terms/', '/contact/'
] as const;
