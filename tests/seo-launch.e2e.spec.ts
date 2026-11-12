import {test,expect} from '@playwright/test';

test('unknown URLs return a real 404, never a duplicated homepage',async({page})=>{
  const response=await page.goto('/this-number-spinner-route-does-not-exist-404/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading',{name:"That page isn't here."})).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.getByRole('link',{name:/Number Spinner home page/i})).toHaveAttribute('href','/');
});

test('preview HTML remains noindex but retains the official self-canonical',async({page})=>{
  await page.goto('/');
  await expect(page).toHaveTitle(/Number Spinner$/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://numberspinner.com/');
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content','Number Spinner');
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
});

test('held landing pages remain noindex in preview, with working internal links',async({page})=>{
  await page.goto('/random-number-wheel/1-7/');
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

test('number wheel pillar links home and defers optional visual fonts',async({page})=>{
  await page.goto('/random-number-wheel/');
  const crumbs=page.getByRole('navigation',{name:'Breadcrumb'});
  await expect(crumbs.getByRole('link',{name:'Home'})).toHaveAttribute('href','/');
  await expect(crumbs.locator('[aria-current="page"]')).toHaveText('Random Number Wheel');
  const font=page.locator('head link[as="style"][href^="https://fonts.googleapis.com/css2"]');
  await expect(font).toHaveCount(1);
  await expect(font).toHaveAttribute('href',/display=optional/);
  const markup=await page.content();
  expect(markup).toContain('<noscript>');
  expect(markup).toContain('fonts.googleapis.com/css2');
});

test('number pillar shows six popular cards and links to the full range directory',async({page})=>{
  await page.goto('/random-number-wheel/');
  const popular=page.locator('.tool-grid').first().locator('.tool-card');
  await expect(popular).toHaveCount(6);
  await expect(popular.first()).toHaveAttribute('href','/random-number-wheel/1-100/');
  await expect(popular.nth(1)).toHaveAttribute('href','/random-number-wheel/1-3/');
  await expect(page.locator('.tool-grid').first().locator('a[href="/random-number-wheel/1-8/"]')).toHaveCount(0);
  await expect(page.getByRole('link',{name:/all number picker tools/i})).toHaveAttribute('href','/tools/');
  await page.goto('/tools/');
  await expect(page.getByRole('heading',{name:'More number range tools'})).toBeVisible();
  await expect(page.locator('a[href="/random-number-wheel/1-8/"]').first()).toBeVisible();
  await expect(page.locator('a[href="/random-number-wheel/1-30/"]').first()).toBeVisible();
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
    await expect(guide.getByRole('button',{name:'Load these wheel settings'})).toHaveCount(2);
    await expect(page.locator('#start')).toHaveCount(1);
  }
});

test('held number pages do not inherit approved-range editorial guides',async({page})=>{
  for(const max of [2,7,10,15,50,200,1000,10000]){
    await page.goto('/random-number-wheel/1-'+max+'/');
    await expect(page.locator('[data-approved-range-guide]')).toHaveCount(0);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
  }
});

test('1–20 roll-call example preloads absences without drawing a result',async({page})=>{
  await page.goto('/random-number-wheel/1-20/');
  const guide=page.locator('[data-approved-range-guide="20"]');
  await guide.locator('[data-range-preset]').nth(1).click();
  await expect(page.locator('[data-role="min"]')).toHaveValue('1');
  await expect(page.locator('[data-role="max"]')).toHaveValue('20');
  await expect(page.locator('[data-role="excluded"]')).toHaveValue('4, 7, 12');
  await expect(page.locator('[data-role="batch"]')).toHaveValue('17');
  await expect(page.locator('[data-role="remove"]')).toBeChecked();
  await expect(page.locator('[data-mode="quick"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('[data-role="result"]')).toHaveText('Ready when you are');
  await expect(guide.locator('[data-range-preset-feedback]')).toContainText('settings loaded');
});

test('1–6 example switches correctly between independent and unique selections',async({page})=>{
  await page.goto('/random-number-wheel/1-6/');
  const buttons=page.locator('[data-approved-range-guide="6"] [data-range-preset]');
  await buttons.nth(1).click();
  await expect(page.locator('[data-role="batch"]')).toHaveValue('6');
  await expect(page.locator('[data-role="remove"]')).toBeChecked();
  await buttons.nth(0).click();
  await expect(page.locator('[data-role="batch"]')).toHaveValue('1');
  await expect(page.locator('[data-role="remove"]')).not.toBeChecked();
  await expect(page.locator('[data-role="excluded"]')).toHaveValue('');
});
