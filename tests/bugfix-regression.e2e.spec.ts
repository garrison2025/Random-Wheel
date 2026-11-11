import {test,expect} from '@playwright/test';

test('empty number minimum cannot silently introduce zero',async({page})=>{
  await page.goto('/random-number-wheel/1-3/');
  await page.locator('[data-role="min"]').fill('');
  await page.locator('[data-action="pick"]').click();
  await expect(page.locator('[data-role="feedback"]')).toContainText('Enter a value for min');
  await expect(page.locator('[data-role="result"]')).not.toHaveText('0');
});

test('entry removal setting survives local save and a reload',async({page})=>{
  await page.goto('/');
  await page.locator('[data-role="remove"]').check();
  await page.locator('[data-action="save"]').click();
  await page.reload();
  await expect(page.locator('[data-role="remove"]')).toBeChecked();
});

test('entry removal setting is included in share links',async({page,context})=>{
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto('/');
  await page.locator('[data-role="remove"]').check();
  await page.locator('[data-action="share"]').click();
  const url=await page.evaluate(()=>navigator.clipboard.readText());
  expect(url).toContain('#wheel=');
  await page.goto(url);
  await expect(page.locator('[data-role="remove"]')).toBeChecked();
});

test('clearing saved setup during spin never restores an old result',async({page})=>{
  await page.goto('/');
  await page.locator('[data-role="speed"]').selectOption('fast');
  await page.locator('[data-action="pick"]').click();
  await page.locator('[data-action="clear"]').click();
  await expect(page.locator('[data-role="result"]')).toHaveText('Ready when you are');
  await page.waitForTimeout(1900);
  await expect(page.locator('[data-role="result"]')).toHaveText('Ready when you are');
});

test('CSV header is skipped and explicit blank weight is rejected',async({page})=>{
  await page.goto('/');
  const file=page.locator('[data-role="file"]');
  await file.setInputFiles({name:'choices.csv',mimeType:'text/csv',buffer:Buffer.from('Name,Weight\nAlice,2\nBob,1\n')});
  await expect(page.locator('[data-role="entries"]')).toHaveValue('Alice | 2\nBob | 1');
  await file.setInputFiles({name:'invalid.csv',mimeType:'text/csv',buffer:Buffer.from('Name,Weight\nAlice,\nBob,1\n')});
  await expect(page.locator('[data-role="feedback"]')).toContainText('weights must be whole numbers');
  await expect(page.locator('[data-role="entries"]')).toHaveValue('Alice | 2\nBob | 1');
});

test('completed Yes/No round rejects wheel swipe as well as click',async({page})=>{
  await page.goto('/yes-or-no-wheel/');
  await page.locator('[data-role="best-of-three"]').check();
  await page.locator('[data-mode="quick"]').click();
  for(let i=0;i<3;i++) {
    const button=page.locator('[data-action="pick"]');
    if(await button.isDisabled())break;
    await button.click();
  }
  await expect(page.locator('[data-role="round-status"]')).toContainText('complete');
  const count=await page.locator('[data-tally]').allTextContents();
  await page.locator('[data-role="wheel-wrap"]').evaluate(el=>{
    el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:42,pointerType:'touch',clientX:10,clientY:150,isPrimary:true}));
    el.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:42,pointerType:'touch',clientX:150,clientY:150,isPrimary:true}));
  });
  expect(await page.locator('[data-tally]').allTextContents()).toEqual(count);
});
