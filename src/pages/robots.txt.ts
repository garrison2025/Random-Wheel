import type {APIRoute} from 'astro';
import {OFFICIAL_ORIGIN,INDEXABLE} from '../lib/site';

// Production main: open crawling. Preview branches: keep them out of search.
export const GET:APIRoute = () => {
  const body = INDEXABLE
    ? [
        'User-agent: *',
        'Allow: /',
        'Sitemap: '+OFFICIAL_ORIGIN+'/sitemap.xml',
        ''
      ].join('\n')
    : 'User-agent: *\nDisallow: /\n';
  return new Response(body,{
    headers:{'Content-Type':'text/plain; charset=utf-8'}
  });
};
