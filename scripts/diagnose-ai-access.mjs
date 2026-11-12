/** Advisory diagnostic. No Cloudflare settings are modified.
 * API quotas, temporary PSI outages or UA-based blocks are reported as evidence,
 * not silently treated as a DNS bug.
 */
import {writeFileSync} from 'node:fs';
const origin='https://numberspinner.com';
const results=[];
const agents=[
  ['normal','Mozilla/5.0 (compatible; NumberSpinnerReachability/1.0)'],
  ['Googlebot','Googlebot/2.1 (+http://www.google.com/bot.html)'],
  ['OAI-SearchBot','Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)'],
  ['Claude-SearchBot','Claude-SearchBot/1.0'],
  ['PerplexityBot','PerplexityBot/1.0']
];
async function check(url,agent){
  try{
    const response=await fetch(url,{redirect:'manual',headers:{'user-agent':agent},signal:AbortSignal.timeout(14000)});
    const body=await response.text();
    return {
      status:response.status,contentType:response.headers.get('content-type'),
      cfMitigated:response.headers.get('cf-mitigated'),
      server:response.headers.get('server'),location:response.headers.get('location'),
      xRobotsTag:response.headers.get('x-robots-tag'),
      bodyPrefix:body.slice(0,120).replace(/\s+/g,' '),
      hasExpectedTitle:body.includes('Number Spinner')||body.includes('Sitemap: https://numberspinner.com/sitemap.xml')
    };
  }catch(error){return {error:String(error)}}
}
for(const [name,agent] of agents){
  results.push({kind:'crawler',agent:name,homepage:await check(origin+'/',agent),
    robots:await check(origin+'/robots.txt',agent)});
}
for(const type of ['A','AAAA']){
  try{
    const r=await fetch('https://dns.google/resolve?name=numberspinner.com&type='+type,{signal:AbortSignal.timeout(12000)});
    const json=await r.json();
    results.push({kind:'dns',type,http:r.status,rcode:json.Status,records:(json.Answer||[]).map(x=>x.data)});
  }catch(error){results.push({kind:'dns',type,error:String(error)})}
}
try{
  const endpoint='https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?url='+
    encodeURIComponent(origin+'/')+'&strategy=mobile&category=performance';
  const response=await fetch(endpoint,{signal:AbortSignal.timeout(90000)});
  const json=await response.json().catch(()=>({}));
  results.push({kind:'pagespeed-api',http:response.status,
    error:json.error?{code:json.error.code,message:json.error.message,status:json.error.status}:null,
    finalUrl:json.lighthouseResult?.finalUrl||null,
    score:json.lighthouseResult?.categories?.performance?.score??null,
    warnings:(json.lighthouseResult?.runWarnings||[]).slice(0,3)});
}catch(error){results.push({kind:'pagespeed-api',error:String(error)})}
const report={timestamp:new Date().toISOString(),origin,results};
writeFileSync('crawler-pagespeed-diagnostic.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
