import {expect,test} from '@playwright/test';

/**
 * Synthetic slower-mobile checks. These are reproducible lab observations,
 * NOT CrUX or 75th percentile real-user Core Web Vitals.
 * Network: 150ms RTT, 1.6 Mbit/s downstream, 750 kbit/s upstream.
 * CPU: Chromium's 4x throttle. Thresholds gate usable behavior, not lab scores.
 */
const routes=[
  {path:'/',name:'custom picker',max:null},
  {path:'/random-number-wheel/',name:'number wheel',max:10},
  {path:'/random-number-wheel/1-100/',name:'1 to 100 instant',max:100}
] as const;

for(const route of routes){
  test('slower mobile can use '+route.name+' without waiting for decoration',async({page,browserName})=>{
    test.skip(browserName!=='chromium','Network and CPU emulation require Chromium DevTools');
    test.setTimeout(75_000);
    await page.setViewportSize({width:390,height:844});
    await page.addInitScript(()=>{
      const vitals={lcp:0,cls:0};
      (window as typeof window & {__slowMobileVitals?:typeof vitals}).__slowMobileVitals=vitals;
      try{new PerformanceObserver(list=>{
        for(const entry of list.getEntries())vitals.lcp=entry.startTime;
      }).observe({type:'largest-contentful-paint',buffered:true});}catch{}
      try{new PerformanceObserver(list=>{
        for(const entry of list.getEntries()){
          const shift=entry as PerformanceEntry & {value:number;hadRecentInput:boolean};
          if(!shift.hadRecentInput)vitals.cls+=shift.value;
        }
      }).observe({type:'layout-shift',buffered:true});}catch{}
    });
    const cdp=await page.context().newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions',{
      offline:false,latency:150,downloadThroughput:200_000,uploadThroughput:93_750,
      connectionType:'cellular4g'
    });
    await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
    try{
      const started=Date.now();
      const response=await page.goto(route.path,{waitUntil:'domcontentloaded',timeout:40_000});
      expect(response?.status()).toBe(200);
      await expect(page.locator('main [data-wheel-app]')).toBeVisible();
      const quick=page.locator('[data-mode="quick"]');
      await quick.click();
      const action=route.max===100
        ?page.locator('[data-action="instant-pick"]')
        :page.locator('[data-action="pick"]');
      await expect(action).toBeVisible();
      await action.click();
      const result=page.locator('[data-role="result"]');
      await expect(result).not.toHaveText('Ready when you are',{timeout:15_000});
      if(route.max!==null){
        const value=Number((await result.textContent())?.trim());
        expect(Number.isSafeInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(route.max);
      }
      const data=await page.evaluate(()=>{
        const nav=performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming|undefined;
        const paint=performance.getEntriesByType('paint').find(e=>e.name==='first-contentful-paint');
        const vital=(window as typeof window & {__slowMobileVitals?:{lcp:number;cls:number}}).__slowMobileVitals;
        const resources=performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        return {
          fcpMs:Math.round(paint?.startTime||0),
          lcpObservedMs:Math.round(vital?.lcp||0),
          clsObserved:Number((vital?.cls||0).toFixed(4)),
          domContentLoadedMs:Math.round(nav?.domContentLoadedEventEnd||0),
          cssResources:resources.filter(v=>v.initiatorType==='link').length,
          googleFontRequests:resources.filter(v=>v.name.includes('fonts.googleapis.com')||v.name.includes('fonts.gstatic.com')).length,
          rootScrollWidth:document.documentElement.scrollWidth,
          viewportWidth:document.documentElement.clientWidth
        };
      });
      expect(data.rootScrollWidth).toBeLessThanOrEqual(data.viewportWidth+1);
      const sample={route:route.path,...data,timeToCompletedFirstPickMs:Date.now()-started};
      console.log('[slower-mobile-sample]',JSON.stringify(sample));
      await test.info().attach('slower-mobile-lab.json',{
        body:Buffer.from(JSON.stringify(sample,null,2)),contentType:'application/json'
      });
    } finally{
      await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
      await cdp.detach();
    }
  });
}

test('tool and answer still work when third-party Google Fonts are unavailable',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.route('https://fonts.googleapis.com/**',route=>route.abort('failed'));
  await page.route('https://fonts.gstatic.com/**',route=>route.abort('failed'));
  await page.goto('/random-number-wheel/1-100/',{waitUntil:'domcontentloaded'});
  const pick=page.locator('[data-action="instant-pick"]');
  await expect(pick).toBeVisible();
  await pick.click();
  const value=Number((await page.locator('[data-role="instant-result"]').textContent())?.trim());
  expect(Number.isSafeInteger(value)).toBe(true);
  expect(value).toBeGreaterThanOrEqual(1);
  expect(value).toBeLessThanOrEqual(100);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(391);
});
