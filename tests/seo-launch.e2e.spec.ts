import {test,expect} from '@playwright/test';

test('unknown URLs return a real 404, never a duplicated homepage',async({page})=>{
  const response=await page.goto('/this-number-spinner-route-does-not-exist-404/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading',{name:"That page isn't here."})).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.getByRole('link',{name:/Number Spinner home page/i})).toHaveAttribute('href','/');
});

test('preview HTML never claims to be indexable and uses the new brand',async({page})=>{
  await page.goto('/');
  await expect(page).toHaveTitle(/Number Spinner$/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content','Number Spinner');
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
});

test('held landing pages remain noindex in preview, with working internal links',async({page})=>{
  await page.goto('/random-number-wheel/1-8/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.getByRole('link',{name:/Custom number range/i})).toHaveAttribute('href','/random-number-wheel/');
});
