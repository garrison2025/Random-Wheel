
import type { APIRoute } from 'astro';
import {DOMAIN,INDEXABLE} from '../lib/site';
export const GET: APIRoute = () => new Response(
  INDEXABLE ? 'User-agent: *\nAllow: /\nSitemap: '+DOMAIN+'/sitemap.xml\n' : 'User-agent: *\nDisallow: /\n',
  {headers:{'Content-Type':'text/plain; charset=utf-8'}}
);
