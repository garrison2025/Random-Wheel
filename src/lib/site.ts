export const SITE_NAME = 'Number Spinner';
export const CONTACT_EMAIL = 'contact@numberspinner.com';
export const OFFICIAL_ORIGIN = 'https://numberspinner.com';
export const DOMAIN = (import.meta.env.PUBLIC_SITE_URL || OFFICIAL_ORIGIN).replace(/\/+$/, '');

// Indexing is an explicit opt-in for an official HTTPS domain only.
// A Cloudflare Pages preview domain must remain non-indexable.
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
export const INDEXABLE = import.meta.env.PUBLIC_INDEXABLE === 'true'
  && isOfficialIndexDomain(DOMAIN);

export const LAUNCH_ROUTES = [
  '/', '/random-number-wheel/', '/random-number-wheel/1-3/', '/random-number-wheel/1-4/',
  '/random-number-wheel/1-5/', '/random-number-wheel/1-6/', '/random-number-wheel/1-20/',
  '/random-number-wheel/1-100/', '/tools/', '/about/', '/privacy/', '/terms/', '/contact/'
] as const;
