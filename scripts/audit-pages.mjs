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
const expectedIndex = process.env.PUBLIC_INDEXABLE === 'true'
  || (process.env.PUBLIC_INDEXABLE !== 'false'
    && process.env.CF_PAGES === '1'
    && process.env.CF_PAGES_BRANCH === 'main');
const site = (process.env.PUBLIC_SITE_URL || 'https://numberspinner.com').replace(/\/+$/, '');
const validDomain = (() => {
  if(site !== 'https://numberspinner.com') return false;
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

if (expectedIndex && !validDomain) fail('GLOBAL', 'PUBLIC_INDEXABLE=true requires https://numberspinner.com as the only official canonical origin.');
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

  // Approved range pages need independently useful, task-specific main content.
  // A candidate page must not acquire an approved editorial block by accident.
  const approvedRange=/^\/random-number-wheel\/1-(3|4|5|6|20|100)\/$/.test(route);
  const hasGuide=html.includes('data-approved-range-guide=');
  if(approvedRange){
    if(!hasGuide)fail(route,'Missing approved-range task guide');
    const cards=(html.match(/class="range-guide-card"/g)||[]).length;
    if(cards!==2)fail(route,'Expected two actionable workflow examples; found '+cards);
    if(!html.includes('What to expect:'))fail(route,'Expected outcome guidance for range tasks');
    const presets=(html.match(/data-range-preset=/g)||[]).length;
    if(presets!==2)fail(route,'Expected two real preset actions for approved workflow examples');
  } else if(hasGuide)fail(route,'Nonapproved route unexpectedly contains an approved-range guide');

  const shouldIndex = liveMode && approved.includes(route);

  const isRangeRoute=/^\/random-number-wheel\/1-\d+\/$/.test(route);
  if(route==='/random-number-wheel/' || isRangeRoute) {
    if(!html.includes('aria-label="Breadcrumb"'))
      fail(route, 'The number-wheel hierarchy must have visible breadcrumb navigation');
    const breadcrumbBlocks=[...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
      .map(match=>match[1]).filter(Boolean);
    let breadcrumbs=[];
    try {
      breadcrumbs=breadcrumbBlocks.map(x=>JSON.parse(x))
        .filter(x=>x['@type']==='BreadcrumbList');
    } catch {
      fail(route,'Invalid JSON-LD in number-wheel hierarchy');
    }
    if(shouldIndex) {
      if(breadcrumbs.length!==1)
        fail(route,'Approved number page requires exactly one matching BreadcrumbList');
      else {
        const elements=breadcrumbs[0].itemListElement;
        const expectedLength=isRangeRoute?3:2;
        if(!Array.isArray(elements)||elements.length!==expectedLength
          ||elements[0]?.item!==site+'/'
          ||elements[1]?.item!==site+'/random-number-wheel/'
          ||elements.at(-1)?.item!==site+route)
          fail(route,'BreadcrumbList does not match visible number-wheel hierarchy');
      }
    } else if(breadcrumbs.length)
      fail(route,'Noindex/preview page must not emit official-domain BreadcrumbList');
    if(isRangeRoute && html.includes('aria-label="Related number picker tools"')) {
      const related=html.match(/<nav\b[^>]*aria-label="Related number picker tools"[^>]*>([\s\S]*?)<\/nav>/i)?.[1]||'';
      if(related.includes('href="'+route+'"'))
        fail(route,'Related number tools include a redundant self-link');
    }
  }

  if(route === '/') {
    const schemas=[...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
      .map(match=>match[1]);
    if(liveMode) {
      if(schemas.length!==1)fail(route,'Expected exactly one WebSite JSON-LD block on official home page');
      else {
        try {
          const schema=JSON.parse(schemas[0]);
          if(schema['@type']!=='WebSite'||schema.name!=='Number Spinner'||schema.url!==site+'/')
            fail(route,'WebSite JSON-LD has wrong brand or official canonical URL');
        } catch {fail(route,'Malformed WebSite JSON-LD');}
      }
    } else if(schemas.length)fail(route,'Staging must not advertise official WebSite JSON-LD');
  }


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

  if (approved.includes(route)) {
    // Canonical must exist even when a staging build is intentionally noindex.
    if (canonical.length !== 1) fail(route, 'Approved URL must have exactly one canonical in every build');
    else if (attr(canonical[0], 'href') !== site + route) fail(route, 'Canonical must equal official self URL');
    if (shouldIndex && robotValue.includes('noindex')) fail(route, 'Approved production page unexpectedly noindex');
    if (!shouldIndex && !robotValue.includes('noindex')) fail(route, 'Approved staging page unexpectedly indexable');
  } else {
    if (!robotValue.includes('noindex')) fail(route, 'Held candidate page unexpectedly indexable');
    if (canonical.length) fail(route, 'Held candidate page must not advertise canonical');
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

// Cloudflare Pages serves unknown routes as the home page when no top-level
// 404.html exists. A dedicated error document is therefore a release gate.
const notFoundFile = 'dist/404.html';
if (!existsSync(notFoundFile)) fail('404', 'Missing dist/404.html: Cloudflare Pages could return SPA fallback 200s.');
else {
  const html = read(notFoundFile);
  const robot = tags(html, 'meta').find(t => attr(t,'name').toLowerCase() === 'robots');
  if (!/noindex/i.test(attr(robot,'content'))) fail('404', 'Custom 404 page must have noindex');
  if (tags(html, 'link').some(t => attr(t,'rel').toLowerCase() === 'canonical'))
    fail('404', '404 page must not advertise a canonical');
  if (!/<h1\b[^>]*>[\s\S]*?<\/h1>/i.test(html)) fail('404', 'Custom 404 page needs a visible H1');
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
