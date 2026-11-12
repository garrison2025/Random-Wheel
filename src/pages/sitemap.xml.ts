import type {APIRoute} from 'astro';
import {OFFICIAL_ORIGIN,INDEXABLE,LAUNCH_ROUTES} from '../lib/site';

// Emit ONLY the 13 editorially approved launch URLs in the production sitemap.
// The other 13 candidate tools exist for users but are intentionally noindex.
const XML_HEADER='<?xml version="1.0" encoding="UTF-8"?>\n';
const XML_START='<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
export const GET:APIRoute = () => {
  const entries = INDEXABLE
    ? LAUNCH_ROUTES.map(path=>'<url><loc>'+OFFICIAL_ORIGIN+path+'</loc></url>').join('')
    : '';
  return new Response(XML_HEADER+XML_START+entries+'</urlset>\n',{
    headers:{'Content-Type':'application/xml; charset=utf-8'}
  });
};
