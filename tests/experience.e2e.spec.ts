
import {expect,test} from '@playwright/test';

test('a horizontal touch swipe spins exactly once; vertical scrolling does not draw',async({page})=>{
  await page.goto('/');
  await page.locator('[data-mode=quick]').click();
  const wheel=page.locator('[data-role=wheel-wrap]');
  await wheel.dispatchEvent('pointerdown',{pointerId:11,pointerType:'touch',isPrimary:true,clientX:80,clientY:170});
  await wheel.dispatchEvent('pointerup',{pointerId:11,pointerType:'touch',isPrimary:true,clientX:180,clientY:180});
  await expect(page.locator('[data-role=history] .history-chip')).toHaveCount(1);
  await wheel.dispatchEvent('pointerdown',{pointerId:12,pointerType:'touch',isPrimary:true,clientX:80,clientY:90});
  await wheel.dispatchEvent('pointerup',{pointerId:12,pointerType:'touch',isPrimary:true,clientX:90,clientY:220});
  await expect(page.locator('[data-role=history] .history-chip')).toHaveCount(1);
});

test('animated draw hides previous winner until the new draw has finished',async({page})=>{
  await page.goto('/');
  await page.locator('[data-mode=quick]').click();
  await page.locator('[data-action=pick]').click();
  await expect(page.locator('[data-role=result]')).not.toHaveText('Ready when you are');
  await page.locator('[data-mode=spin]').click();
  await page.locator('[data-action=pick]').click();
  await expect(page.locator('[data-role=result]')).toHaveText('Spinning…');
  await expect(page.locator('[data-action=pick]')).toBeDisabled();
  await expect(page.locator('[data-role=result]')).toContainText(/Alex|Jordan|Taylor|Morgan|Casey|Sam/,{timeout:7000});
  await expect(page.locator('[data-role=history] .history-chip')).toHaveCount(2);
});

test('reduced motion completes immediately and omits spark animations',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await page.locator('[data-action=pick]').click();
  await expect(page.locator('[data-role=result]')).not.toHaveText('Spinning…');
  await expect(page.locator('.winner-spark')).toHaveCount(0);
});

test('large range quick drawing stays responsive under a conservative lab budget',async({page})=>{
  await page.goto('/random-number-wheel/1-100/');
  await page.locator('[data-role=max]').fill('10000');
  await page.locator('[data-role=max]').dispatchEvent('change');
  await expect(page.locator('[data-role=candidate-count]')).toContainText('10000 active');
  const time=await page.evaluate(()=>{
    const before=performance.now();
    const el=document.querySelector<HTMLButtonElement>('[data-action=pick]')!;
    el.click();
    return performance.now()-before;
  });
  expect(time).toBeLessThan(2000);
  const result=Number(await page.locator('[data-role=result]').innerText());
  expect(result).toBeGreaterThanOrEqual(1);
  expect(result).toBeLessThanOrEqual(10000);
});
