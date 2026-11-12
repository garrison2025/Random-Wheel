/**
 * Post-deployment HTTP + SEO checks for numberspinner.com.
 * Run with: npm run audit:live
 * This DOES NOT modify Cloudflare or prove GSC indexing.
 */
const ROOT = 'https://numberspinner.com';
const HOST = 'numberspinner.com';
const PAGE_ALIAS = 'https://random-wheel-58c.pages.dev';
const approved = [
  '/', '/random-number-wheel/', '/random-number-wheel/1-3/',
  '/random-number-wheel/1-4/', '/random-number-wheel/1-5/',
  '/random-number-wheel/1-6/', '/random-number-wheel/1-20/',
  '/random-number-wheel/1-100/', '/tools/', '/about/',
  '/privacy/', '/terms/', '/contact/'
];
const held = [
  '/random-word-wheel/', '/random-letter-wheel/', '/yes-or-no-wheel/',
  ...[2,7,8,10,15,30,50,200,1000,10000].map(n=>'/random-number-wheel/1-'+n+'/')
];
const failures=[],checks=[],recommendations=[];
const report=(label,good,details='',required=true)=>{
  checks.push({label,passed:good,details,required});
  if(!good){
    const message=label+(details?': '+details:'');
    (required?failures:recommendations).push(message);
  }
};
async function request(url,redirect='manual'){
  const response=await fetch(url,{redirect,headers:{'user-agent':'NumberSpinnerPostDeployAudit/1.0'},signal:AbortSignal.timeout(12000)});
  const body=await response.text();
  return {response,body};
}
function attr(tag,key){
  return tag?.match(new RegExp('\\b'+key+'=["\\x27]([^"\\x27]*)["\\x27]','i'))?.[1]||'';
}
function getMeta(html,key){
  const tags=html.match(/<meta\b[^>]*>/gi)||[];
  const tag=tags.find(t=>attr(t,'name').toLowerCase()===key.toLowerCase());
  return attr(tag,'content');
}
function getCanonical(html){
  return (html.match(/<link\b[^>]*>/gi)||[]).filter(t=>attr(t,'rel').toLowerCase()==='canonical').map(t=>attr(t,'href'));
}
async function checkPage(path,indexable){
  const label=path+' ['+(indexable?'index':'hold')+']';
  try{
    const {response,body}=await request(ROOT+path);
    const xRobots=response.headers.get('x-robots-tag')||'';
    const robots=getMeta(body,'robots').toLowerCase();
    const canonicals=getCanonical(body);
    report(label+' HTTP',response.status===200,'status '+response.status);
    report(label+' title & H1',/<title\b[^>]*>[^<]+<\/title>/i.test(body)&&/<h1\b[^>]*>/i.test(body));
    report(label+' robots',indexable
      ? !robots.includes('noindex')&&!xRobots.toLowerCase().includes('noindex')&&!!robots
      : robots.includes('noindex'),'meta='+robots+' header='+xRobots);
    report(label+' canonical',indexable
      ? canonicals.length===1&&canonicals[0]===ROOT+path
      : canonicals.length===0,canonicals.join(', '));
    if(path==='/'){
      const scripts=[...body.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
      let schemaGood=false;
      try {
        const schemas=scripts.map(match=>JSON.parse(match[1]));
        schemaGood=schemas.length===1 && schemas[0]['@type']==='WebSite'
          && schemas[0].name==='Number Spinner'
          && schemas[0].url===ROOT+'/';
      } catch {}
      report('Homepage WebSite JSON-LD',schemaGood);
      report('Homepage OG site name',/<meta\b[^>]*property=["']og:site_name["'][^>]*content=["']Number Spinner["']/i.test(body));
    }
  }catch(error){report(label,false,String(error));}
}
async function checkRedirect(origin,tag){
  const suffix='/random-number-wheel/1-3/?audit=1';
  try{
    const {response}=await request(origin+suffix);
    const target=response.headers.get('location')||'';
    const permanentlyRedirected=response.status===301&&target===ROOT+suffix;
    // The owner opted to defer canonical-host redirects. Keep the
    // recommendation visible without failing verified core indexing.
    report(tag+' redirects to canonical',permanentlyRedirected,
      'status '+response.status+' location='+target,false);
    if(tag==='Production pages.dev alias'){
      const fallbackNoindex=(response.headers.get('x-robots-tag')||'').toLowerCase().includes('noindex');
      report('Legacy pages.dev alias has safe interim noindex or permanent redirect',
        permanentlyRedirected || fallbackNoindex,
        'status '+response.status+' x-robots-tag='+(response.headers.get('x-robots-tag')||''));
    }
  }catch(error){report(tag+' redirects to canonical',false,String(error),false);}
}
console.log('Auditing Number Spinner HTTP release at '+ROOT);
const routes=[...approved.map(path=>({path,indexable:true})),...held.map(path=>({path,indexable:false}))];
for(let i=0;i<routes.length;i+=5){
  await Promise.all(routes.slice(i,i+5).map(({path,indexable})=>checkPage(path,indexable)));
}
try {
  const {response,body}=await request(ROOT+'/this-random-wheel-page-does-not-exist-seo-audit-404/');
  report('Unknown path serves true HTTP 404',response.status===404,'status '+response.status);
  const errorRobots=getMeta(body,'robots').toLowerCase();
  report('Unknown path has noindex',errorRobots.includes('noindex'),'meta='+errorRobots);
  report('Unknown path is not the home page',/page (isn.t here|not found)|404/i.test(body)
    && getCanonical(body).length===0,'canonical='+getCanonical(body).join(','));
}catch(error){report('Unknown path / soft-404 check',false,String(error));}
try {
  const {response,body}=await request(ROOT+'/robots.txt');
  report('robots.txt HTTP',response.status===200,'status '+response.status);
  report('robots.txt crawl permitted',!/^Disallow:\s*\/\s*$/mi.test(body)
    && body.includes('Sitemap: '+ROOT+'/sitemap.xml'));
}catch(error){report('robots.txt',false,String(error));}
try{
  const {response,body}=await request(ROOT+'/sitemap.xml');
  const links=[...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
  const expected=approved.map(path=>ROOT+path);
  report('Sitemap HTTP',response.status===200,'status '+response.status);
  report('Sitemap whitelist',links.length===expected.length
    && new Set(links).size===links.length&&links.every(url=>expected.includes(url))
    && expected.every(url=>links.includes(url)),'found '+links.length+' URLs');
}catch(error){report('Sitemap',false,String(error));}
await checkRedirect('https://www.'+HOST,'www');
await checkRedirect(PAGE_ALIAS,'Production pages.dev alias');
console.log(JSON.stringify({origin:ROOT,checks:checks.length,passed:checks.filter(x=>x.passed).length,
  failed:failures.length,failures,
  recommendations:recommendations.length,advisories:recommendations},null,2));
if(failures.length)process.exitCode=1;
