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

test('number tools expose human-readable breadcrumb hierarchy and relevant links',async({page})=>{
  await page.goto('/random-number-wheel/1-3/');
  const crumbs=page.getByRole('navigation',{name:'Breadcrumb'});
  await expect(crumbs.getByRole('link',{name:'Home'})).toHaveAttribute('href','/');
  await expect(crumbs.getByRole('link',{name:'Random Number Wheel'})).toHaveAttribute('href','/random-number-wheel/');
  await expect(crumbs.locator('[aria-current="page"]')).toHaveText('Numbers 1–3');
  const related=page.getByRole('navigation',{name:'Related number picker tools'});
  await expect(related.locator('a[href="/random-number-wheel/1-3/"]')).toHaveCount(0);
  await expect(related.getByRole('link',{name:'Pick a number from 1 to 100'}))
    .toHaveAttribute('href','/random-number-wheel/1-100/');
});

test('number wheel pillar links to the home page and loads fonts directly from HTML',async({page})=>{
  await page.goto('/random-number-wheel/');
  const crumbs=page.getByRole('navigation',{name:'Breadcrumb'});
  await expect(crumbs.getByRole('link',{name:'Home'})).toHaveAttribute('href','/');
  await expect(crumbs.locator('[aria-current="page"]')).toHaveText('Random Number Wheel');
  await expect(page.locator('link[rel="stylesheet"][href^="https://fonts.googleapis.com/css2"]'))
    .toHaveCount(1);
});

test('main number picker surfaces approved high-intent ranges ahead of held candidates',async({page})=>{
  await page.goto('/random-number-wheel/');
  const popular=page.locator('.tool-grid').first().locator('.tool-card');
  await expect(popular).toHaveCount(6);
  await expect(popular.first()).toHaveAttribute('href','/random-number-wheel/1-100/');
  await expect(popular.nth(1)).toHaveAttribute('href','/random-number-wheel/1-3/');
  await expect(page.locator('.tool-grid').first().locator('a[href="/random-number-wheel/1-8/"]')).toHaveCount(0);
  await expect(page.getByRole('link',{name:/all number picker tools/i})).toHaveAttribute('href','/tools/');
  await page.goto('/tools/');
  await expect(page.getByRole('heading',{name:'More number range tools'})).toBeVisible();
  await expect(page.getByRole('link',{name:/Numbers 1–8/i})).toHaveAttribute('href','/random-number-wheel/1-8/');
});
