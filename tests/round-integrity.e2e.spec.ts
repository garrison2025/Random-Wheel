import {test,expect} from '@playwright/test';

test('no-repeat quick picks survive an equivalent edit immediately before drawing',async({page})=>{
  await page.goto('/');
  const list=page.locator('[data-role="entries"]');
  await list.fill('Alpha\nBeta\nGamma');
  await page.locator('[data-role="remove"]').check();
  await page.locator('[data-mode="quick"]').click();
  await page.locator('[data-action="pick"]').click();
  await expect(page.locator('.history-chip')).toHaveCount(1);
  // Same semantic pool, only trailing whitespace changed; flush the pending edit.
  await list.fill('Alpha\nBeta\nGamma\n');
  await page.locator('[data-action="pick"]').click();
  const history=await page.locator('.history-chip').allTextContents();
  expect(history).toHaveLength(2);
  expect(new Set(history).size).toBe(2);
  await expect(page.locator('[data-role="candidate-count"]')).toContainText('1 active choice');
});

test('debounced equivalent edit does not silently restart a no-repeat round',async({page})=>{
  await page.goto('/');
  const list=page.locator('[data-role="entries"]');
  await list.fill('Red\nBlue');
  await page.locator('[data-role="remove"]').check();
  await page.locator('[data-mode="quick"]').click();
  await page.locator('[data-action="pick"]').click();
  await list.fill('  Red  \n Blue \n');
  await page.waitForTimeout(260);
  await expect(page.locator('.history-chip')).toHaveCount(1);
  await page.locator('[data-action="pick"]').click();
  expect(new Set(await page.locator('.history-chip').allTextContents()).size).toBe(2);
  await expect(page.locator('[data-role="candidate-count"]')).toContainText('0 active choices');
});

test('a genuinely edited pool invalidates prior winner indices before a quick pick',async({page})=>{
  await page.goto('/');
  const list=page.locator('[data-role="entries"]');
  await list.fill('Old A\nOld B');
  await page.locator('[data-role="remove"]').check();
  await page.locator('[data-mode="quick"]').click();
  await page.locator('[data-action="pick"]').click();
  await list.fill('New only');
  await page.locator('[data-action="pick"]').click();
  await expect(page.locator('[data-role="result"]')).toHaveText('New only');
  await expect(page.locator('.history-chip')).toHaveCount(1);
  await expect(page.locator('[data-role="candidate-count"]')).toContainText('0 active choices');
});

test('invalid unsaved entries never overwrite an earlier valid local save',async({page})=>{
  await page.goto('/');
  const list=page.locator('[data-role="entries"]');
  await list.fill('Permanent A\nPermanent B');
  await page.locator('[data-action="save"]').click();
  await expect(page.locator('[data-role="feedback"]')).toContainText('Setup saved');
  await list.fill('');
  await page.locator('[data-action="save"]').click();
  await expect(page.locator('[data-role="feedback"]')).toContainText('Add 1–100 wheel entries');
  await page.reload();
  await expect(list).toHaveValue('Permanent A\nPermanent B');
  await expect(page.locator('[data-role="feedback"]')).toContainText('Your saved wheel is ready.');
});

test('restoring an impossible no-repeat batch fails and restores defaults',async({page})=>{
  await page.goto('/random-number-wheel/1-2/');
  await page.locator('[data-role="remove"]').check();
  await page.locator('[data-action="save"]').click();
  await expect(page.locator('[data-role="feedback"]')).toContainText('Setup saved');
  await page.evaluate(()=>{
    const key=Object.keys(localStorage).find(k=>k.startsWith('wheelcanvas.v1.numbers'));
    if(!key)throw new Error('Missing saved range setup');
    const saved=JSON.parse(localStorage.getItem(key)!);
    saved.batch='3';
    localStorage.setItem(key,JSON.stringify(saved));
  });
  await page.reload();
  await expect(page.locator('[data-role="feedback"]')).toContainText('original defaults restored');
  await expect(page.locator('[data-role="feedback"]')).not.toContainText('Your saved wheel is ready.');
  await expect(page.locator('[data-role="remove"]')).not.toBeChecked();
  await expect(page.locator('[data-role="batch"]')).toHaveValue('1');
});

test('an invalid saved batch string cannot silently fall back to another batch',async({page})=>{
  await page.goto('/random-number-wheel/1-3/');
  await page.locator('[data-action="save"]').click();
  await page.evaluate(()=>{
    const key=Object.keys(localStorage).find(k=>k.startsWith('wheelcanvas.v1.numbers'));
    if(!key)throw new Error('Missing saved range setup');
    const saved=JSON.parse(localStorage.getItem(key)!);
    saved.batch='not-a-number';
    localStorage.setItem(key,JSON.stringify(saved));
  });
  await page.reload();
  await expect(page.locator('[data-role="feedback"]')).toContainText('original defaults restored');
  await expect(page.locator('[data-role="feedback"]')).toContainText('Invalid batch size');
});

test('a one-column CSV preserves Name unless header skipping is explicitly requested',async({page})=>{
  await page.goto('/');
  const upload=page.locator('[data-role="file"]');
  const file={name:'names.csv',mimeType:'text/csv',buffer:Buffer.from('Name\nAlice\nBob\n')};
  await upload.setInputFiles(file);
  await expect(page.locator('[data-role="entries"]')).toHaveValue('Name\nAlice\nBob');
  await page.locator('[data-role="csv-has-header"]').check();
  await upload.setInputFiles([]);
  await upload.setInputFiles(file);
  await expect(page.locator('[data-role="entries"]')).toHaveValue('Alice\nBob');
});

test('very large safe integer bounds with a huge step produce exact distinct results',async({page})=>{
  await page.goto('/random-number-wheel/');
  const bound=Number.MAX_SAFE_INTEGER;
  await page.locator('[data-role="min"]').fill(String(-bound));
  await page.locator('[data-role="max"]').fill(String(bound));
  await page.locator('[data-role="step"]').fill(String(bound));
  await page.locator('[data-role="batch"]').fill('3');
  await page.locator('[data-role="remove"]').check();
  await page.locator('[data-action="pick"]').click();
  await expect(page.locator('.history-chip')).toHaveCount(3);
  expect(new Set(await page.locator('.history-chip').allTextContents())).toEqual(
    new Set([String(-bound),'0',String(bound)])
  );
});
