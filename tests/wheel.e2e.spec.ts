
import {expect,test} from '@playwright/test';
test('preset 1–3 is immediately usable and non-repeating',async({page})=>{
  await page.goto('/random-number-wheel/1-3/');
  await expect(page.locator('h1')).toContainText('1 to 3');
  await expect(page.locator('[data-role=min]')).toHaveValue('1');
  await expect(page.locator('[data-role=max]')).toHaveValue('3');
  await page.locator('[data-role=remove]').check();
  const results = new Set<string>();
  for(let i=0;i<3;i++){
    await page.locator('[data-action=pick]').click();
    const text=(await page.locator('[data-role=result]').innerText()).trim();
    expect(['1','2','3']).toContain(text);
    expect(results.has(text)).toBe(false);
    results.add(text);
  }
  await page.locator('[data-action=pick]').click();
  await expect(page.locator('[data-role=feedback]')).toContainText('No choices remain');
  await page.locator('[data-action=reset]').click();
  await expect(page.locator('[data-role=candidate-count]')).toContainText('3 active');
});
test('large range uses a visual abstraction, not a tiny 10000-slice wheel',async({page})=>{
  await page.goto('/random-number-wheel/1-100/');
  await expect(page.locator('[data-role=wheel-wrap]')).toHaveClass(/is-abstract/);
  await page.locator('[data-role=max]').fill('10000');
  await page.locator('[data-role=max]').dispatchEvent('change');
  await page.locator('[data-action=pick]').click();
  const v=Number((await page.locator('[data-role=result]').innerText()).trim());
  expect(v).toBeGreaterThanOrEqual(1);expect(v).toBeLessThanOrEqual(10000);
});
test('landing pages have server-rendered copy and noindex until domain launch',async({request})=>{
  for(const range of ['1-3','1-4','1-5','1-6','1-20','1-100']){
    const response=await request.get('/random-number-wheel/'+range+'/');
    expect(response.status()).toBe(200);
    const html=await response.text();
    expect(html).toContain('name="description"');
    expect(html).toContain('noindex, nofollow');
    expect(html).toContain('How to pick');
  }
});
test('mobile layout has no horizontal overflow',async({page})=>{
  await page.setViewportSize({width:360,height:780});
  await page.goto('/random-number-wheel/1-5/');
  await expect(page.locator('[data-action=pick]')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)).toBe(false);
});
test('custom wheel renders user input as text, not markup',async({page})=>{
  await page.goto('/');
  await page.locator('[data-role=entries]').fill('<img src=x onerror=alert(1)> | 1\nOther | 1');
  await page.locator('[data-role=entries]').dispatchEvent('change');
  await expect(page.locator('img[src=x]')).toHaveCount(0);
  await page.locator('[data-mode=quick]').click();
  await page.locator('[data-action=pick]').click();
  await expect(page.locator('[data-role=result]')).not.toHaveText('Ready to pick');
});

test('new visual workspace keeps the wheel prominent and center action works',async({page})=>{
  await page.goto('/');
  await expect(page.locator('.stage .wheel-wrap')).toBeVisible();
  await expect(page.locator('.sidebar [data-role=entries]')).toBeVisible();
  await expect(page.locator('.wheel-center')).toBeVisible();
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('[data-action=center]').click();
  await expect(page.locator('[data-role=result]')).not.toHaveText('Ready when you are');
  await expect(page.locator('[data-action=center]')).toBeEnabled();
});

test('example chips change the wheel contents without a reload',async({page})=>{
  await page.goto('/');
  await page.locator('[data-template=yesno]').click();
  await expect(page.locator('[data-role=entries]')).toHaveValue('Yes\nNo');
  await expect(page.locator('[data-role=candidate-count]')).toContainText('2 active');
  await page.locator('[data-template=teams]').click();
  await expect(page.locator('[data-role=candidate-count]')).toContainText('4 active');
});

test('UI fits narrow phones without layout clipping',async({page})=>{
  for(const width of [320,360,390]){
    await page.setViewportSize({width,height:740});
    for(const path of ['/', '/random-number-wheel/1-100/']){
      await page.goto(path);
      const result=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,window:innerWidth,center:!!document.querySelector('[data-action=center]')}));
      expect(result.center).toBeTruthy();
      expect(result.scroll).toBeLessThanOrEqual(result.window+1);
    }
  }
});
