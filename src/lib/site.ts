
export const SITE_NAME = 'WheelCanvas';
export const DOMAIN = (import.meta.env.PUBLIC_SITE_URL || '').replace(/\/+$/, '');
// The Pages production alias is not the canonical .com site. Never allow an accidental\n// PUBLIC_INDEXABLE=true setting to expose the preview/alias as an indexable host.\nexport const INDEXABLE = import.meta.env.PUBLIC_INDEXABLE === 'true'\n  && /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}$/i.test(DOMAIN)\n  && !/\\.pages\\.dev$/i.test(DOMAIN)\n  && !/(^|\\.)example\\./i.test(DOMAIN);
export const LAUNCH_ROUTES = [
  '/', '/random-number-wheel/', '/random-number-wheel/1-3/', '/random-number-wheel/1-4/',
  '/random-number-wheel/1-5/', '/random-number-wheel/1-6/', '/random-number-wheel/1-20/',
  '/random-number-wheel/1-100/', '/tools/', '/about/', '/privacy/', '/terms/', '/contact/'
] as const;
