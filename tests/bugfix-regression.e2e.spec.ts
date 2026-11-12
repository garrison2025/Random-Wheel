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

test('blank batch size does not silently draw one result',async({page})=>{
  await page.goto('/random-number-wheel/1-20/');
  await page.locator('[data-role="batch"]').fill('');
  await page.locator('[data-action="pick"]').click();
  await expect(page.locator('[data-role="feedback"]')).toContainText('Enter how many results');
  await expect(page.locator('[data-role="result"]')).toHaveText('Ready when you are');
});

test('CSV multiline labels are rejected without mutating the current list',async({page})=>{
  await page.goto('/');
  const original=await page.locator('[data-role="entries"]').inputValue();
  await page.locator('[data-role="file"]').setInputFiles({
    name:'multiline.csv',mimeType:'text/csv',
    buffer:Buffer.from('Name,Weight\n"Alice\nAdmin",2\nBob,1\n')
  });
  await expect(page.locator('[data-role="feedback"]')).toContainText('name contains a line break');
  await expect(page.locator('[data-role="entries"]')).toHaveValue(original);
});

test('duplicate labels behave as separate tickets in remove-winners mode',async({page})=>{
  await page.goto('/');
  await page.locator('[data-role="entries"]').fill('Alice\nAlice\nBob');
  await page.locator('[data-role="entries"]').dispatchEvent('change');
  await page.locator('[data-role="remove"]').check();
  await page.locator('[data-mode="quick"]').click();
  for(let i=0;i<3;i++)await page.locator('[data-action="pick"]').click();
  await expect(page.locator('[data-role="candidate-count"]')).toContainText('0 active choices');
  await page.locator('[data-action="pick"]').click();
  await expect(page.locator('[data-role="feedback"]')).toContainText('No choices remain');
});

test('malicious inherited palette names cannot corrupt shared wheel setups',async({page})=>{
  const shared={type:'custom',entries:'North\nSouth',palette:'constructor',speed:'fast',remove:true};
  await page.goto('/#wheel='+encodeURIComponent(JSON.stringify(shared)));
  await expect(page.locator('[data-role="entries"]')).toHaveValue('North\nSouth');
  await expect(page.locator('[data-role="remove"]')).toBeChecked();
  await page.locator('[data-mode="quick"]').click();
  await page.locator('[data-action="pick"]').click();
  expect(['North','South']).toContain((await page.locator('[data-role="result"]').textContent())?.trim());
});

test('wheel recovers its valid overlay after all numbers are excluded',async({page})=>{
  await page.goto('/random-number-wheel/1-3/');
  const excluded=page.locator('[data-role="excluded"]');
  await excluded.fill('1, 2, 3');
  await excluded.dispatchEvent('change');
  await expect(page.locator('[data-role="wheel-overlay"]')).toHaveText('No available choices');
  await excluded.fill('');
  await excluded.dispatchEvent('change');
  await expect(page.locator('[data-role="candidate-count"]')).toContainText('3 active choices');
  await expect(page.locator('[data-role="wheel-overlay"]')).toHaveText('All eligible numbers included');
});

test('rapid edit immediately followed by a spin does not reset the winner',async({page})=>{
  await page.goto('/');
  await page.locator('[data-role="entries"]').fill('Alpha\nBeta\nGamma');
  // Fill queues the debounced edit handler; starting a spin must cancel it.
  await page.locator('[data-action="pick"]').click();
  await expect(page.locator('[data-role="result"]')).toHaveText('Spinning…');
  await page.waitForTimeout(350);
  await expect(page.locator('[data-role="result"]')).toHaveText('Spinning…');
  await expect(page.locator('[data-role="result"]')).toContainText(/Alpha|Beta|Gamma/, {timeout:7000});
});
