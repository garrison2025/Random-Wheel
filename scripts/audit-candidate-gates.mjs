import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
const manifest=JSON.parse(readFileSync('docs/seo-competitor-gates.json','utf8'));
const statuses=['RELEASED','PROMISING_NOT_APPROVED','FIX_FIRST','HOLD'];
const candidates=manifest.candidates;
const releasedPaths=['/random-number-wheel/1-8/','/random-number-wheel/1-30/'];
if(manifest.indexingApproval!==false)throw Error('Blanket index approval remains disabled');
if(candidates.length!==13||new Set(candidates.map(c=>c.path)).size!==13)
  throw Error('Preserve the thirteen original candidate review records');
const counts=Object.fromEntries(statuses.map(status=>[status,candidates.filter(c=>c.status===status).length]));
if(counts.RELEASED!==2||counts.PROMISING_NOT_APPROVED!==0||counts.FIX_FIRST!==6||counts.HOLD!==5)
  throw Error('Index pilot status changed without a new editorial review');
if(JSON.stringify(manifest.pilotIndexApproval)!==JSON.stringify(releasedPaths))
  throw Error('Index-pilot route list does not match approval records');
const site=readFileSync('src/lib/site.ts','utf8');
const ranges=readFileSync('src/data/ranges.ts','utf8');
if(!readFileSync('src/pages/sitemap.xml.ts','utf8').includes('LAUNCH_ROUTES'))
  throw Error('Sitemap must continue to use controlled launch routes');
const production=process.env.CF_PAGES==='1'
  ?process.env.CF_PAGES_BRANCH==='main'
  :process.env.PUBLIC_INDEXABLE==='true';
let errors=0;
for(const c of candidates){
  if(!c.path.startsWith('/')||!c.path.endsWith('/')||!statuses.includes(c.status))
    throw Error('Invalid candidate path/status');
  if(c.status!=='HOLD'&&c.competitors.length<3)
    throw Error('Missing comparator references: '+c.path);
  if(c.competitors.some(url=>!url.startsWith('https://')))
    throw Error('Invalid comparator URL');
  const released=c.status==='RELEASED';
  if(released!==releasedPaths.includes(c.path))throw Error('Pilot decision mismatch '+c.path);
  if(released!==site.includes("'"+c.path+"'")){console.error('WHITELIST STATUS MISMATCH',c.path);errors++;}
  const file=join('dist',c.path,'index.html');
  if(!existsSync(file)){console.error('MISSING PAGE',c.path);errors++;continue;}
  const html=readFileSync(file,'utf8');
  const robots=released&&production?'index, follow, max-image-preview:large'
    :production?'noindex, follow':'noindex, nofollow';
  if(!html.includes('name="robots" content="'+robots+'"')){
    console.error('ROBOTS POLICY MISMATCH',c.path,robots);errors++;
  }
  const canonical='<link rel="canonical" href="https://numberspinner.com'+c.path+'"';
  if(html.includes(canonical)!==released){console.error('CANONICAL STATUS MISMATCH',c.path);errors++;}
  if(!html.includes('<h1')||!html.includes('name="description"')){
    console.error('PAGE ESSENTIALS MISSING',c.path);errors++;
  }
  const slug=/\/random-number-wheel\/(1-\d+)\/$/.exec(c.path)?.[1];
  if(slug){
    if(!ranges.includes("slug:'"+slug+"',max:")){console.error('RANGE DATA MISSING',c.path);errors++;}
    const heldRange=new RegExp("slug:'"+slug+"',max:\\d+,indexApproved:false").test(ranges);
    if(heldRange===released){console.error('RANGE FLAG MISMATCH',c.path);errors++;}
  }else{
    const route=join('src/pages',c.path,'index.astro');
    if(!existsSync(route)||!readFileSync(route,'utf8').includes('noindex={true}')){
      console.error('HELD TOOL INDEX GATE MISSING',c.path);errors++;
    }
  }
  if(released && (!html.includes('data-number-task="'+(c.path.includes('1-8/')?'stations':'attendance')+'"')
    || !html.includes('data-task="generate"'))){
    console.error('INDEX-PILOT TASK MISSING',c.path);errors++;
  }
}
console.log('Candidate SEO release gates: '+candidates.length+' historical URLs; '+JSON.stringify(counts)+'; errors: '+errors);
if(errors)process.exit(1);
