/**
 * Built HTML SEO gate.
 * Run after `npm run build`; it makes no claims about live Cloudflare or GSC state.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const approved = [
  '/', '/random-number-wheel/', '/random-number-wheel/1-3/',
  '/random-number-wheel/1-4/', '/random-number-wheel/1-5/',
  '/random-number-wheel/1-6/', '/random-number-wheel/1-20/',
  '/random-number-wheel/1-100/', '/tools/', '/about/',
  '/privacy/', '/terms/', '/contact/'
];
const held = [
  '/random-word-wheel/', '/random-letter-wheel/', '/yes-or-no-wheel/',
  ...[2, 7, 8, 10, 15, 30, 50, 200, 1000, 10000]
    .map(n => '/random-number-wheel/1-' + n + '/')
];
const all = [...approved, ...held];
const expectedIndex = process.env.PUBLIC_INDEXABLE === 'true';
const site = (process.env.PUBLIC_SITE_URL || '').replace(/\/+$/, '');
const validDomain = (() => {
  try {
    const url = new URL(site);
    const host = url.hostname.toLowerCase();
    return url.protocol === 'https:' && url.origin === site
      && /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(host)
      && !host.includes('..')
      && host !== 'pages.dev' && !host.endsWith('.pages.dev')
      && !/(^|\.)example\./i.test(host);
  } catch {
    return false;
  }
})();
const liveMode = expectedIndex && validDomain;
const failures = [];
const warnings = [];
const seenTitles = new Map();
const seenDescriptions = new Map();
const fail = (route, reason) => failures.push(route + ': ' + reason);
const warn = (route, reason) => warnings.push(route + ': ' + reason);
const read = file => readFileSync(file, 'utf8');
const get = (html, regex) => html.match(regex)?.[1]?.trim() || '';
const attr = (tag, name) =>
  tag.match(new RegExp('\\b' + name + '=["\\x27]([^"\\x27]*)["\\x27]', 'i'))?.[1] || '';
const tags = (html, name) =>
  [...html.matchAll(new RegExp('<' + name + '\\b[^>]*>', 'gi'))].map(m => m[0]);

if (expectedIndex && !validDomain) fail('GLOBAL', 'PUBLIC_INDEXABLE=true requires a real custom HTTPS domain, not pages.dev.');
if (new Set(all).size !== all.length) fail('GLOBAL', 'Duplicate route in the audit inventory.');

for (const route of all) {
  const filename = join('dist', route, 'index.html');
  if (!existsSync(filename)) { fail(route, 'Missing built HTML'); continue; }
  const html = read(filename);
  const title = get(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const headings = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  const metas = tags(html, 'meta');
  const links = tags(html, 'link');
  const description = metas.find(t => attr(t, 'name').toLowerCase() === 'description');
  const robots = metas.find(t => attr(t, 'name').toLowerCase() === 'robots');
  const canonical = links.filter(t => attr(t, 'rel').toLowerCase() === 'canonical');
  const desc = description ? attr(description, 'content') : '';
  const robotValue = robots ? attr(robots, 'content').toLowerCase() : '';
  const shouldIndex = liveMode && approved.includes(route);

  if (!/^<!doctype html>/i.test(html.trimStart())) fail(route, 'Missing HTML5 doctype');
  if (!/<html\s[^>]*lang=["']en["']/i.test(html)) fail(route, 'Expected English html lang');
  if (!title) fail(route, 'Missing document title');
  if (headings.length !== 1) fail(route, 'Expected exactly one H1, found ' + headings.length);
  if (!desc || desc.length < 45) fail(route, 'Missing or uninformative description');
  if (!robotValue) fail(route, 'Missing robots meta');
  if (seenTitles.has(title)) fail(route, 'Duplicate title with ' + seenTitles.get(title));
  else seenTitles.set(title, route);
  if (seenDescriptions.has(desc)) fail(route, 'Duplicate description with ' + seenDescriptions.get(desc));
  else seenDescriptions.set(desc, route);

  if (shouldIndex) {
    if (robotValue.includes('noindex')) fail(route, 'Approved production page unexpectedly noindex');
    if (canonical.length !== 1) fail(route, 'Expected exactly one canonical');
    else if (attr(canonical[0], 'href') !== site + route) fail(route, 'Canonical must equal configured official URL');
  } else {
    if (!robotValue.includes('noindex')) fail(route, 'Unapproved or staging page exposed for indexing');
    if (canonical.length) fail(route, 'Held/staging page must not advertise canonical');
  }

  // Static link checks: ignore fragments, schemes and query-only links.
  for (const tag of tags(html, 'a')) {
    const href = attr(tag, 'href');
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const target = href.split(/[?#]/)[0] || '/';
    if (/\.[a-z0-9]+$/i.test(target)) continue;
    const normalized = target.endsWith('/') ? target : target + '/';
    if (!all.includes(normalized)) warn(route, 'Local link points outside the audited HTML route list: ' + href);
  }
}

const sitemapFile = 'dist/sitemap.xml';
const robotsFile = 'dist/robots.txt';
if (!existsSync(sitemapFile)) fail('SITEMAP', 'Missing sitemap.xml');
if (!existsSync(robotsFile)) fail('ROBOTS', 'Missing robots.txt');
if (existsSync(sitemapFile)) {
  const xml = read(sitemapFile);
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x => x[1]);
  const expected = liveMode ? approved.map(r => site + r) : [];
  for (const url of expected) if (!urls.includes(url)) fail('SITEMAP', 'Missing approved URL ' + url);
  for (const url of urls) if (!expected.includes(url)) fail('SITEMAP', 'Unexpected/index-held URL ' + url);
  if (new Set(urls).size !== urls.length) fail('SITEMAP', 'Duplicate loc URL');
  if (!xml.includes('<urlset')) fail('SITEMAP', 'Invalid sitemap root');
}
if (existsSync(robotsFile)) {
  const txt = read(robotsFile);
  if (liveMode) {
    if (/Disallow:\s*\//i.test(txt)) fail('ROBOTS', 'Official site blocks root crawl');
    if (!txt.includes('Sitemap: ' + site + '/sitemap.xml')) fail('ROBOTS', 'Missing official sitemap declaration');
  } else if (!/Disallow:\s*\//i.test(txt)) {
    fail('ROBOTS', 'Staging must block search crawling');
  }
}
console.log(JSON.stringify({
  audit: 'Random Wheel built SEO gate',
  mode: liveMode ? 'approved-custom-domain' : 'staging-protected',
  auditedHtmlRoutes: all.length, approvedRoutes: approved.length,
  heldRoutes: held.length, failures, warnings
}, null, 2));
if (failures.length) process.exitCode = 1;
