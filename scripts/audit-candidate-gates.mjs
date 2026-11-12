import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
const manifest=JSON.parse(readFileSync('docs/seo-competitor-gates.json','utf8'));
const statuses=['PROMISING_NOT_APPROVED','FIX_FIRST','HOLD'];
const candidates=manifest.candidates;
if(manifest.indexingApproval!==false)throw new Error('Index approval flag cannot be turned on without a new editorial gate');
if(candidates.length!==13)throw new Error('Expected exactly thirteen held candidate URLs');
if(new Set(candidates.map(x=>x.path)).size!==13)throw new Error('Duplicate candidate URLs');
const counts=Object.fromEntries(statuses.map(status=>[status,candidates.filter(x=>x.status===status).length]));
if(counts.PROMISING_NOT_APPROVED!==2||counts.FIX_FIRST!==6||counts.HOLD!==5)throw new Error('Candidate gate status unexpectedly changed; manual review required');
const site=readFileSync('src/lib/site.ts','utf8');
const rangeData=readFileSync('src/data/ranges.ts','utf8');
const sitemap=readFileSync('src/pages/sitemap.xml.ts','utf8');
if(!sitemap.includes('LAUNCH_ROUTES'))throw new Error('Sitemap must still use controlled launch list');
const productionIndexing = process.env.PUBLIC_INDEXABLE === 'true'
  || (process.env.PUBLIC_INDEXABLE !== 'false'
    && process.env.CF_PAGES === '1'
    && process.env.CF_PAGES_BRANCH === 'main');
const candidateRobots = productionIndexing ? 'noindex, follow' : 'noindex, nofollow';
let errors=0;
for(const c of candidates){
  if(!c.path.startsWith('/')||!c.path.endsWith('/'))throw new Error('Invalid route path');
  if(!statuses.includes(c.status))throw new Error('Unexpected candidate status: '+c.path);
  if(c.status!=='HOLD'&&c.competitors.length<3)throw new Error('Missing three comparator URLs: '+c.path);
  if(c.competitors.some(url=>!url.startsWith('https://')))throw new Error('Non-HTTPS comparator');
  if(site.includes("'"+c.path+"'"))throw new Error('Candidate appears in approved launch whitelist: '+c.path);
  const htmlFile=join('dist',c.path,'index.html');
  if(!existsSync(htmlFile)){console.error('CANDIDATE NOT BUILT',c.path);errors++;continue;}
  const html=readFileSync(htmlFile,'utf8');
  if(!html.includes('name="robots" content="'+candidateRobots+'"')){console.error('CANDIDATE ROBOTS POLICY MISMATCH',c.path, candidateRobots);errors++;}
  if(html.includes('<link rel="canonical"')){console.error('NOINDEX CANDIDATE HAS CANONICAL',c.path);errors++;}
  if(!html.includes('<h1')||!html.includes('name="description"')){console.error('MISSING PAGE ESSENTIALS',c.path);errors++;}
  const slug=/\/random-number-wheel\/(1-\d+)\/$/.exec(c.path)?.[1];
  if(slug&&!rangeData.includes("slug:'"+slug+"',max:")){console.error('CANDIDATE RANGE MISSING',c.path);errors++;}
  if(slug&&!new RegExp("slug:'"+slug+"',max:\\d+,indexApproved:false").test(rangeData)){console.error('RANGE NOT HARD NOINDEX',c.path);errors++;}
  if(!slug){
    const route=join('src/pages',c.path,'index.astro');
    if(!existsSync(route)||!readFileSync(route,'utf8').includes('noindex={true}')){console.error('CANDIDATE TOOL INDEX GATE MISSING',c.path);errors++;}
  }
}
console.log('Candidate SEO release gates: '+candidates.length+' checked; '+JSON.stringify(counts)+'; errors: '+errors);
if(errors)process.exit(1);
