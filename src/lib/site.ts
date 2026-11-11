
export const SITE_NAME = 'WheelCanvas';
export const DOMAIN = (import.meta.env.PUBLIC_SITE_URL || '').replace(/\/+$/, '');
export const INDEXABLE = import.meta.env.PUBLIC_INDEXABLE === 'true' && /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}$/i.test(DOMAIN) && !DOMAIN.includes('example');
export const LAUNCH_ROUTES = [
  '/', '/random-number-wheel/', '/random-number-wheel/1-3/', '/random-number-wheel/1-4/',
  '/random-number-wheel/1-5/', '/random-number-wheel/1-6/', '/random-number-wheel/1-20/',
  '/random-number-wheel/1-100/', '/tools/', '/about/', '/privacy/', '/terms/', '/contact/'
] as const;
