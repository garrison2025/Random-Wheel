import {expect,test} from '@playwright/test';

/**
 * Mobile lab checks for the three organic-search entry points.
 * LCP/CLS below are observations from headless Chromium, NOT CrUX field data.
 * The actionable release gate is that a visitor can see and use the tool
 * without horizontal clipping or inaccessible controls.
 */
const targets=[
  {name:'home',path:'/',maximum:null},
  {name:'general-number',path:'/random-number-wheel/',maximum:10},
  {name:'number-1-100',path:'/random-number-wheel/1-100/',maximum:100}
] as const;

for(const target of targets){
  for(const viewport of [320,390]){
    test(`mobile SEO: ${target.name} is usable at ${viewport}px`,async({page})=>{
      await page.setViewportSize({width:viewport,height:780});
      await page.addInitScript(()=>{
        const metrics={
          lcp:0,cls:0,
          shifts:[] as Array<{value:number;time:number;nodes:Array<{tag:string;className:string;fromY:number;toY:number}>}>
        };
        (window as typeof window & {__numberSpinnerMetrics?:typeof metrics}).__numberSpinnerMetrics=metrics;
        try{
          new PerformanceObserver(list=>{
            for(const entry of list.getEntries())metrics.lcp=entry.startTime;
          }).observe({type:'largest-contentful-paint',buffered:true});
        }catch{}
        try{
          new PerformanceObserver(list=>{
            for(const entry of list.getEntries()){
              const shift=entry as PerformanceEntry & {value:number;hadRecentInput:boolean};
              if(!shift.hadRecentInput){
                metrics.cls+=shift.value;
                const item=shift as typeof shift & {
                  sources?:Array<{node?:Node;previousRect?:DOMRectReadOnly;currentRect?:DOMRectReadOnly}>
                };
                metrics.shifts.push({
                  value:Number(shift.value.toFixed(4)),time:Math.round(shift.startTime),
                  nodes:(item.sources||[]).slice(0,4).map(source=>{
                    const element=source.node instanceof Element?source.node:null;
                    return {
                      tag:element?.tagName||'unknown',
                      className:String(element?.getAttribute('class')||'').slice(0,90),
                      fromY:Math.round(source.previousRect?.y||0),
                      toY:Math.round(source.currentRect?.y||0)
                    };
                  })
                });
              }
            }
          }).observe({type:'layout-shift',buffered:true});
        }catch{}
      });
      const response=await page.goto(target.path,{waitUntil:'domcontentloaded'});
      expect(response?.status()).toBe(200);
      await expect(page.locator('main h1')).toHaveCount(1);
      await expect(page.locator('main [data-wheel-app]')).toBeVisible();
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href','https://numberspinner.com'+target.path
      );
      const pick=page.locator('main [data-action="pick"]');
      await expect(pick).toBeVisible();
      const rect=await pick.boundingBox();
      expect(rect?.height||0).toBeGreaterThanOrEqual(44);
      const overflow=await page.evaluate(()=>({
        rootWidth:document.documentElement.scrollWidth,
        viewportWidth:document.documentElement.clientWidth
      }));
      expect(overflow.rootWidth).toBeLessThanOrEqual(overflow.viewportWidth+1);

      if(target.maximum!==null){
        await expect(page.locator('[data-role="min"]')).toHaveValue('1');
        await expect(page.locator('[data-role="max"]')).toHaveValue(String(target.maximum));
        await expect(page.locator('[data-mode="quick"]')).toHaveAttribute('aria-pressed','true');
        await pick.click();
        const result=page.locator('[data-role="result"]');
        await expect(result).not.toHaveText('Ready when you are');
        const n=Number((await result.textContent())?.trim());
        expect(Number.isInteger(n)).toBe(true);
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(target.maximum);
      }

      const metrics=await page.evaluate(()=>{
        const navigation=performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming|undefined;
        const readings=(window as typeof window & {__numberSpinnerMetrics?:{lcp:number;cls:number;shifts:unknown[]}}).__numberSpinnerMetrics;
        return {
          viewportWidth:document.documentElement.clientWidth,
          lcpLabMs:Math.round(readings?.lcp||0),
          clsLab:Number((readings?.cls||0).toFixed(4)),
          shiftSources:readings?.shifts||[],
          ttfbLabMs:navigation?Math.round(navigation.responseStart-navigation.requestStart):null
        };
      });
      console.log('[mobile-seo-lab]',target.name,viewport,JSON.stringify(metrics));
      await test.info().attach('mobile-seo-lab.json',{
        body:Buffer.from(JSON.stringify({route:target.path,...metrics},null,2)),
        contentType:'application/json'
      });
      if(viewport===390){
        await test.info().attach('mobile-viewport.png',{
          body:await page.screenshot({fullPage:false,animations:'disabled'}),
          contentType:'image/png'
        });
      }
    });
  }
}

test('keyboard users can bypass global navigation and reach main content',async({page})=>{
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip=page.getByRole('link',{name:'Skip to main content'});
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main-content$/);
  await expect(page.locator('#main-content')).toBeVisible();
});

test('reduced-motion settings preserve the same number-picker outcome',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/random-number-wheel/1-100/');
  await expect(page.locator('[data-mode="quick"]')).toHaveAttribute('aria-pressed','true');
  await page.locator('[data-action="pick"]').click();
  await expect(page.locator('[data-role="result"]')).not.toHaveText('Ready when you are');
});

test('1–100 mobile visitors can generate and read a number before the wheel',async({page})=>{
  await page.setViewportSize({width:320,height:780});
  await page.goto('/random-number-wheel/1-100/');
  const fast=page.getByRole('button',{name:'Generate a number now'});
  const inlineResult=page.locator('[data-role="instant-result"]');
  const wheel=page.locator('.wheel-wrap');
  await expect(fast).toBeVisible();
  const fastBox=await fast.boundingBox();
  const wheelBox=await wheel.boundingBox();
  expect(fastBox).not.toBeNull();
  expect(wheelBox).not.toBeNull();
  expect(fastBox!.y+fastBox!.height).toBeLessThan(wheelBox!.y);
  await fast.click();
  const text=(await inlineResult.textContent())?.trim()||'';
  const value=Number(text);
  expect(Number.isInteger(value)).toBe(true);
  expect(value).toBeGreaterThanOrEqual(1);
  expect(value).toBeLessThanOrEqual(100);
  await expect(page.locator('[data-role="result"]')).toHaveText(text);
  await page.locator('[data-action="reset"]').click();
  await expect(inlineResult).toHaveText('—');
  await page.goto('/random-number-wheel/1-20/');
  await expect(page.locator('[data-action="instant-pick"]')).toHaveCount(0);
});

test('1–100 desktop retains full wheel presentation and quick pick workflow',async({page})=>{
  await page.setViewportSize({width:1280,height:800});
  await page.goto('/random-number-wheel/1-100/');
  await expect(page.locator('.instant-first')).toBeHidden();
  await expect(page.locator('.wheel-wrap')).toBeVisible();
  await page.locator('[data-action="pick"]').click();
  await expect(page.locator('[data-role="result"]')).not.toHaveText('Ready when you are');
});

test('mobile 1–100 copies the latest result and disables copy after reset',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.addInitScript(()=>{
    Object.defineProperty(navigator,'clipboard',{
      configurable:true,value:{writeText:async (value:string)=>{
        (window as typeof window & {__copiedNumber?:string}).__copiedNumber=value;
      }}
    });
  });
  await page.goto('/random-number-wheel/1-100/');
  const copy=page.locator('[data-action="instant-copy"]');
  await expect(copy).toBeDisabled();
  await page.locator('[data-action="instant-pick"]').click();
  await expect(copy).toBeEnabled();
  const value=(await page.locator('[data-role="instant-result"]').textContent())?.trim();
  await copy.click();
  expect(await page.evaluate(()=>(window as typeof window & {__copiedNumber?:string}).__copiedNumber))
    .toBe(value);
  await expect(page.locator('[data-role="instant-copy-feedback"]')).toHaveText('Number copied.');
  await page.locator('[data-action="reset"]').click();
  await expect(copy).toBeDisabled();
  await expect(page.locator('[data-role="instant-result"]')).toHaveText('—');
});

test('mobile batch copy contains all results rather than a truncated visual preview',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.addInitScript(()=>{
    Object.defineProperty(navigator,'clipboard',{
      configurable:true,value:{writeText:async (value:string)=>{
        (window as typeof window & {__copiedNumber?:string}).__copiedNumber=value;
      }}
    });
  });
  await page.goto('/random-number-wheel/1-100/');
  const count=page.locator('[data-role="batch"]');
  await count.fill('10');
  await count.dispatchEvent('change');
  await page.locator('[data-action="instant-pick"]').click();
  await expect(page.locator('[data-action="instant-copy"]')).toBeEnabled();
  await page.locator('[data-action="instant-copy"]').click();
  const values=(await page.evaluate(()=>
    (window as typeof window & {__copiedNumber?:string}).__copiedNumber))?.split('\n')||[];
  expect(values).toHaveLength(10);
  values.forEach(v=>{
    expect(Number(v)).toBeGreaterThanOrEqual(1);
    expect(Number(v)).toBeLessThanOrEqual(100);
  });
  await expect(page.locator('[data-role="instant-copy-feedback"]')).toHaveText('Latest batch copied.');
});

test('instant clipboard rejection gives an inline message and leaves the result intact',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.addInitScript(()=>{
    Object.defineProperty(navigator,'clipboard',{
      configurable:true,value:{writeText:async()=>{throw Error('denied');}}
    });
  });
  await page.goto('/random-number-wheel/1-100/');
  await page.locator('[data-action="instant-pick"]').click();
  const before=await page.locator('[data-role="instant-result"]').textContent();
  await page.locator('[data-action="instant-copy"]').click();
  await expect(page.locator('[data-role="instant-copy-feedback"]')).toContainText('Clipboard unavailable');
  await expect(page.locator('[data-role="instant-result"]')).toHaveText(before||'');
});
