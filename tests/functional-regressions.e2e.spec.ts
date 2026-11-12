import {expect,test} from '@playwright/test';

test('rapid editing before picking resets stale removal indices',async({page})=>{
  await page.goto('/');
  await page.locator('[data-role="entries"]').fill('Alice');
  await page.locator('[data-role="entries"]').dispatchEvent('change');
  await page.locator('[data-role="remove"]').check();
  await page.locator('[data-mode="quick"]').click();
  await page.locator('[data-action="pick"]').click();
  await expect(page.locator('[data-role="result"]')).toHaveText('Alice');

  // Input and click deliberately run in the same browser task. The 180ms
  // deferred refresh must not carry Alice's used index onto Carol.
  await page.evaluate(()=>{
    const input=document.querySelector<HTMLTextAreaElement>('[data-role="entries"]')!;
    input.value='Carol';
    input.dispatchEvent(new Event('input',{bubbles:true}));
    document.querySelector<HTMLButtonElement>('[data-action="pick"]')!.click();
  });
  await expect(page.locator('[data-role="result"]')).toHaveText('Carol');
  await expect(page.locator('[data-role="feedback"]')).not.toHaveClass(/error/);

  // No-change consecutive draw still honors no-repeat.
  await page.locator('[data-action="pick"]').click();
  await expect(page.locator('[data-role="feedback"]')).toContainText('No choices remain');
});

test('invalid numeric settings cannot overwrite the last valid local save',async({page})=>{
  await page.goto('/random-number-wheel/');
  await page.locator('[data-role="max"]').fill('5');
  await page.locator('[data-role="max"]').dispatchEvent('change');
  await page.locator('[data-action="save"]').click();
  await expect(page.locator('[data-role="feedback"]')).toContainText('Setup saved');
  const saved=await page.evaluate(()=>localStorage.getItem('wheelcanvas.v1.numbers'));
  expect(saved).toContain('"max":"5"');

  await page.locator('[data-role="min"]').fill('');
  await page.locator('[data-action="save"]').click();
  await expect(page.locator('[data-role="feedback"]')).toContainText('Enter a value for min');
  expect(await page.evaluate(()=>localStorage.getItem('wheelcanvas.v1.numbers'))).toBe(saved);

  await page.reload();
  await expect(page.locator('[data-role="min"]')).toHaveValue('1');
  await expect(page.locator('[data-role="max"]')).toHaveValue('5');
  await expect(page.locator('[data-role="feedback"]')).toContainText('saved wheel is ready');
});

test('invalid existing saved setup restores default controls and reports failure',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('wheelcanvas.v1.numbers',JSON.stringify({
      type:'numbers',min:'',max:'4',step:'1',excluded:'',batch:'1',
      palette:'sunset',speed:'normal',remove:false
    }));
  });
  await page.goto('/random-number-wheel/');
  await expect(page.locator('[data-role="min"]')).toHaveValue('1');
  await expect(page.locator('[data-role="max"]')).toHaveValue('10');
  await expect(page.locator('[data-role="feedback"]')).toContainText('invalid');
  await expect(page.locator('[data-role="feedback"]')).toHaveClass(/error/);
  await page.locator('[data-action="pick"]').click();
  const winner=Number((await page.locator('[data-role="result"]').textContent())?.trim());
  expect(winner).toBeGreaterThanOrEqual(1);
  expect(winner).toBeLessThanOrEqual(10);
});

test('no-repeat batch settings are validated before saving',async({page})=>{
  await page.goto('/random-number-wheel/1-3/');
  await page.locator('[data-role="remove"]').check();
  await page.locator('[data-role="batch"]').fill('4');
  await page.locator('[data-action="save"]').click();
  await expect(page.locator('[data-role="feedback"]')).toContainText('Not enough eligible choices');
  const saved=await page.evaluate(()=>{
    return Object.keys(localStorage).filter(key=>key.startsWith('wheelcanvas.v1.numbers'));
  });
  expect(saved).toEqual([]);
});

test('one-column CSV Name header is explicit; a real Name label is retained without it',async({page})=>{
  await page.goto('/');
  const input=page.locator('[data-role="file"]');
  const rows=Buffer.from('Name\nAlice\nBob\n','utf8');
  await input.setInputFiles({name:'team.csv',mimeType:'text/csv',buffer:rows});
  await expect(page.locator('[data-role="entries"]')).toHaveValue('Name\nAlice\nBob');
  await page.locator('[data-role="csv-has-header"]').check();
  await input.setInputFiles([]);
  await input.setInputFiles({name:'team.csv',mimeType:'text/csv',buffer:rows});
  await expect(page.locator('[data-role="entries"]')).toHaveValue('Alice\nBob');
});

test('word import can skip an explicitly declared CSV header',async({page})=>{
  await page.goto('/random-word-wheel/');
  await page.locator('[data-role="word-category"]').selectOption('custom');
  await page.locator('[data-role="csv-has-header"]').check();
  await page.locator('[data-role="file"]').setInputFiles({
    name:'words.csv',mimeType:'text/csv',buffer:Buffer.from('Name\nRiver\nForest\n','utf8')
  });
  await expect(page.locator('[data-role="word-custom"]')).toHaveValue('River\nForest');
});
