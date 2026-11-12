import type {APIRoute} from 'astro';
import {OFFICIAL_ORIGIN,INDEXABLE} from '../lib/site';

// Explicit search/assistant fetcher sections improve interoperability with
// simple robots.txt parsers. The '*' group already allows them. Cloudflare
// security settings can still block crawlers at the edge.
const SEARCH_BOTS=[
  'OAI-SearchBot','ChatGPT-User','Claude-SearchBot','Claude-User',
  'PerplexityBot','Googlebot','Bingbot','Applebot','DuckDuckBot'
] as const;

export const GET:APIRoute = () => {
  const lines=INDEXABLE
    ? [
        '# Official production site',
        ...SEARCH_BOTS.flatMap(bot=>['User-agent: '+bot,'Allow: /','']),
        'User-agent: *','Allow: /','',
        'Sitemap: '+OFFICIAL_ORIGIN+'/sitemap.xml',''
      ]
    : ['User-agent: *','Disallow: /',''];
  return new Response(lines.join('\n'),{
    headers:{'Content-Type':'text/plain; charset=utf-8'}
  });
};
