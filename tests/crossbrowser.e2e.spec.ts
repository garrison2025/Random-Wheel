
import {expect,test} from '@playwright/test';

test('custom wheel supports a secure quick pick, editing and reset',async({page})=>{
  await page.goto('/');
  await expect(page.locator('main .wheel-wrap')).toBeVisible();
  await page.locator('[data-role=entries]').fill('Alpha\nBeta\nGamma');
  await page.locator('[data-role=entries]').dispatchEvent('change');
  await page.locator('[data-mode=quick]').click();
  await page.locator('[data-action=center]').click();
  await expect(page.locator('[data-role=result]')).toContainText(/Alpha|Beta|Gamma/);
  await page.locator('[data-action=reset]').click();
  await expect(page.locator('[data-role=result]')).toHaveText('Ready when you are');
});

test('number preset renders correctly on narrow mobile and excludes unavailable numbers',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/random-number-wheel/1-20/');
  await expect(page.locator('[data-role=max]')).toHaveValue('20');
  await page.locator('[data-role=excluded]').fill('1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19');
  await page.locator('[data-role=excluded]').dispatchEvent('change');
  await page.locator('[data-action=pick]').click();
  await expect(page.locator('[data-role=result]')).toHaveText('20');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(391);
});

test('save and restore options without server-side accounts',async({page})=>{
  await page.goto('/');
  await page.locator('[data-role=entries]').fill('East\nWest');
  await page.locator('[data-action=save]').click();
  await page.reload();
  await expect(page.locator('[data-role=entries]')).toHaveValue('East\nWest');
});
