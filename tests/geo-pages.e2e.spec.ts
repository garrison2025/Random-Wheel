import {expect,test} from '@playwright/test';

const approved=[
  '/', '/random-number-wheel/', '/random-number-wheel/1-3/',
  '/random-number-wheel/1-4/', '/random-number-wheel/1-5/',
  '/random-number-wheel/1-6/', '/random-number-wheel/1-20/',
  '/random-number-wheel/1-100/'
];

test('every launch tool has visible, route-specific answer facts without duplicate schema in preview',async({page})=>{
  for(const path of approved){
    await page.goto(path);
    const facts=page.locator('[data-geo-tool]');
    await expect(facts).toHaveCount(1);
    await expect(facts).toHaveAttribute('data-geo-tool',path);
    await expect(facts.locator('h2')).toContainText('At a glance:');
    await expect(facts.locator('dl dt')).toHaveText([
      'What you get','How the draw works','Repeats and exclusions','Privacy and sharing'
    ]);
    await expect(facts.locator('a[href="/about/#how-results-are-generated"]')).toHaveCount(1);
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
  }
});

test('GEO evidence links lead to the original methodology in human-readable HTML',async({page})=>{
  await page.goto('/random-number-wheel/1-100/');
  await page.locator('[data-geo-tool] a[href="/about/#how-results-are-generated"]').click();
  await expect(page).toHaveURL(/\/about\/#how-results-are-generated$/);
  await expect(page.locator('#how-results-are-generated')).toHaveText('How results are generated');
  await expect(page.getByRole('link',{name:'random number and weighting algorithms'}))
    .toHaveAttribute('href',/github\.com\/garrison2025\/Random-Wheel\/blob\/main\/src\/lib\/random\.ts$/);
  await expect(page.getByRole('link',{name:'wheel interaction and result logic'}))
    .toHaveAttribute('href',/github\.com\/garrison2025\/Random-Wheel\/blob\/main\/src\/scripts\/wheel\.ts$/);
  await expect(page.getByRole('link',{name:'MDN\'s Crypto.getRandomValues reference'}))
    .toHaveAttribute('href',/developer\.mozilla\.org/);
});

test('GEO did not expose held candidates as approved tools or change robots policy',async({page})=>{
  for(const path of ['/random-number-wheel/1-8/','/random-number-wheel/1-30/','/random-letter-wheel/']){
    await page.goto(path);
    await expect(page.locator('[data-geo-tool]')).toHaveCount(0);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
  }
});

test('tool comparison helps readers choose an actual tool without mobile overflow',async({page})=>{
  await page.setViewportSize({width:360,height:800});
  await page.goto('/tools/');
  const comparison=page.getByRole('region',{name:'Compare random picker tools'});
  await expect(comparison).toBeVisible();
  await expect(page.getByRole('heading',{name:'Which random picker should you use?'})).toBeVisible();
  await expect(comparison.locator('tbody tr')).toHaveCount(5);
  await expect(comparison.getByRole('link',{name:'1–100 Number Picker'}))
    .toHaveAttribute('href','/random-number-wheel/1-100/');
  const dimensions=await page.evaluate(()=>({
    documentWidth:document.documentElement.scrollWidth,
    viewportWidth:document.documentElement.clientWidth
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth+1);
});

test('homepage presents actionable steps and cites inspectable randomness sources',async({page})=>{
  await page.goto('/');
  const article=page.locator('.article').first();
  await expect(article.getByRole('heading',{name:'How to use your wheel'})).toBeVisible();
  await expect(article.locator('ol li')).toHaveCount(4);
  await expect(article.locator('ul li')).toHaveCount(3);
  await expect(article.getByRole('link',{name:'MDN API reference'}))
    .toHaveAttribute('href','https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues');
  await expect(article.getByRole('link',{name:'public sampling implementation'}))
    .toHaveAttribute('href',/github\.com\/garrison2025\/Random-Wheel/);
  await page.goto('/about/');
  await expect(page.locator('time[datetime="2026-11-12"]')).toBeVisible();
  await expect(page.getByRole('link',{name:'W3C Web Cryptography specification'}))
    .toHaveAttribute('href','https://www.w3.org/TR/WebCryptoAPI/');
});
