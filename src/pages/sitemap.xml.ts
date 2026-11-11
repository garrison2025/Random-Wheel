
import type {APIRoute} from 'astro';
import {DOMAIN,INDEXABLE,LAUNCH_ROUTES} from '../lib/site';
export const GET:APIRoute = () => new Response(
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+
    (INDEXABLE? LAUNCH_ROUTES.map(route=>'<url><loc>'+DOMAIN+route+'</loc></url>').join('') : '')+
  '</urlset>\n',{headers:{'Content-Type':'application/xml; charset=utf-8'}}
);
