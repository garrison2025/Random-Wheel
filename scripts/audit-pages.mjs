
import {existsSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
const routes=['/','/random-number-wheel/','/random-number-wheel/1-3/','/random-number-wheel/1-4/','/random-number-wheel/1-5/','/random-number-wheel/1-6/','/random-number-wheel/1-20/','/random-number-wheel/1-100/','/tools/','/about/','/privacy/','/terms/','/contact/'];
let errors=0;
for(const route of routes){
  const file=join('dist',route,'index.html');
  if(!existsSync(file)){console.error('MISSING',route,file);errors++;continue;}
  const html=readFileSync(file,'utf8');
  if(!html.includes('<h1') || !html.includes('name="description"') || !html.includes('name="robots"')){console.error('MISSING SEO',route);errors++;}
  if(!html.includes('noindex') && process.env.PUBLIC_INDEXABLE!=='true'){console.error('STAGING EXPOSED',route);errors++;}
}
if(!existsSync('dist/robots.txt')||!existsSync('dist/sitemap.xml')){console.error('Missing robots or sitemap');errors++;}
console.log('Audited '+routes.length+' static routes; errors: '+errors);
if(errors)process.exit(1);
