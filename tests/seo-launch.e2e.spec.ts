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

test('approved number pages have unique task-first guides with working tool anchors',async({page})=>{
  const approved=[
    {max:3,heading:'Three-way decisions and fair first turns'},
    {max:4,heading:'Four-corner games and station selection'},
    {max:5,heading:'Five-option games, task picks and rotations'},
    {max:6,heading:'A six-sided die or a six-person draw?'},
    {max:20,heading:'A roll call for twenty numbered students'},
    {max:100,heading:'Instant 1–100 picks and unique number samples'}
  ];
  for(const {max,heading} of approved){
    await page.goto('/random-number-wheel/1-'+max+'/');
    const guide=page.locator('[data-approved-range-guide="'+max+'"]');
    await expect(guide).toHaveCount(1);
    await expect(guide.getByRole('heading',{name:heading})).toBeVisible();
    await expect(guide.locator('.range-guide-card')).toHaveCount(2);
    await expect(guide.getByRole('link',{name:'Try this with the number wheel'})).toHaveCount(2);
    await expect(page.locator('#start')).toHaveCount(1);
  }
});

test('held number pages do not inherit approved-range editorial guides',async({page})=>{
  for(const max of [2,7,8,10,15,30,50,200,1000,10000]){
    await page.goto('/random-number-wheel/1-'+max+'/');
    await expect(page.locator('[data-approved-range-guide]')).toHaveCount(0);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
  }
});
