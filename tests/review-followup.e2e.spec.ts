import {expect,test} from '@playwright/test';
import {readFile} from 'node:fs/promises';

test('invalid list drafts pause drawing and restoring the last valid list resumes the same no-repeat round',async({page})=>{
  await page.goto('/');
  const list=page.locator('[data-role="entries"]');
  await list.fill('A\nB\nC');
  await page.locator('[data-role="remove"]').check();
  await page.locator('[data-mode="quick"]').click();
  await page.locator('[data-action="pick"]').click();
  await expect(page.locator('[data-role="history"] .history-chip')).toHaveCount(1);
  const firstWinner=(await page.locator('[data-role="history"] .history-chip').first().textContent())?.trim();
  await list.fill('');
  await page.waitForTimeout(240);
  await expect(page.locator('[data-role="feedback"]')).toContainText('Add 1–100 wheel entries');
  await expect(page.locator('[data-action="pick"]')).toBeDisabled();
  await expect(page.locator('[data-role="history"] .history-chip')).toHaveCount(1);
  await list.fill('A\nB\nC');
  await page.waitForTimeout(240);
  await expect(page.locator('[data-role="feedback"]')).toContainText('Previous round restored');
  await expect(page.locator('[data-role="candidate-count"]')).toContainText('2 active choices');
  await expect(page.locator('[data-role="history"] .history-chip')).toHaveCount(1);
  await page.locator('[data-action="pick"]').click();
  await expect(page.locator('[data-role="history"] .history-chip')).toHaveCount(2);
  const winners=await page.locator('[data-role="history"] .history-chip').allTextContents();
  expect(new Set(winners).size).toBe(2);
  expect(winners).toContain(firstWinner);
});

test('reduced-motion spin places the actual winning segment under the pointer',async({page})=>{
  await page.addInitScript(()=>{
    Object.defineProperty(window.crypto,'getRandomValues',{
      configurable:true,
      value:(buffer:Uint32Array)=>{buffer.fill(0);return buffer;}
    });
  });
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await page.locator('[data-action="pick"]').click();
  await expect(page.locator('[data-role="result"]')).toHaveText('Alex');
  await expect(page.locator('[data-role="wheel-disc"]')).toHaveAttribute('style',/transform: rotate\(330deg\)/);
  await expect(page.locator('.winner-spark')).toHaveCount(0);
});

test('clear saved removes only local configuration and preserves completed results',async({page})=>{
  await page.goto('/');
  await page.locator('[data-mode="quick"]').click();
  await page.locator('[data-action="pick"]').click();
  const result=await page.locator('[data-role="result"]').textContent();
  await expect(page.locator('[data-role="history"] .history-chip')).toHaveCount(1);
  await page.locator('[data-action="clear"]').click();
  await expect(page.locator('[data-role="result"]')).toHaveText(result||'');
  await expect(page.locator('[data-role="history"] .history-chip')).toHaveCount(1);
});

test('batch button label reflects the requested number of results',async({page})=>{
  await page.goto('/random-number-wheel/1-100/');
  await page.locator('[data-role="batch"]').fill('3');
  await expect(page.locator('[data-action="pick"]')).toHaveText('⚡ Pick 3 numbers');
  await page.locator('[data-action="pick"]').click();
  await expect(page.locator('[data-role="history"] .history-chip')).toHaveCount(3);
});

test('weighted probability disclosure shows exact per-ticket chances and recalculates after removal',async({page})=>{
  await page.goto('/');
  await page.locator('[data-role="entries"]').fill('A | 3\nB | 1\nA | 2');
  await page.waitForTimeout(240);
  const panel=page.locator('.probability-panel');
  await panel.locator('summary').click();
  const items=panel.locator('[data-role="probability-list"] li');
  await expect(items).toHaveCount(3);
  await expect(items.nth(0)).toContainText('#1 A — weight 3 · 50.00%');
  await expect(items.nth(1)).toContainText('#2 B — weight 1 · 16.67%');
  await expect(items.nth(2)).toContainText('#3 A — weight 2 · 33.33%');
  await page.locator('[data-role="remove"]').check();
  await page.locator('[data-mode="quick"]').click();
  await page.locator('[data-action="pick"]').click();
  await expect(items).toHaveCount(2);
  const percentages=await items.allTextContents();
  const numeric=percentages.map(text=>Number(text.match(/(\d+\.\d+)%/)?.[1]));
  expect(numeric.every(value=>Number.isFinite(value))).toBeTruthy();
  expect(numeric.reduce((sum,value)=>sum+value,0)).toBeCloseTo(100,0);
});

test('large equal-weight ranges show the exact probability without rendering thousands of rows',async({page})=>{
  await page.goto('/random-number-wheel/1-100/');
  await page.locator('[data-role="max"]').fill('10000');
  await page.locator('[data-role="max"]').dispatchEvent('change');
  const panel=page.locator('.probability-panel');
  await expect(panel.locator('[data-role="probability-caption"]')).toContainText('10000 eligible tickets');
  await expect(panel.locator('[data-role="probability-caption"]')).toContainText('0.0100% each');
  await expect(panel.locator('[data-role="probability-list"] li')).toHaveCount(0);
  await expect(page.locator('[data-role="wheel-overlay"]')).toContainText('decorative display only');
});

test('setup JSON export and import preserve the selected mode and local options',async({page})=>{
  await page.goto('/');
  await page.locator('[data-role="entries"]').fill('Red\nGreen\nBlue');
  await page.locator('[data-mode="quick"]').click();
  await page.locator('[data-role="remove"]').check();
  await page.locator('[data-action="save"]').click();
  const downloadPromise=page.waitForEvent('download');
  await page.locator('[data-action="export-setup"]').click();
  const download=await downloadPromise;
  expect(download.suggestedFilename()).toBe('number-spinner-setup.json');
  const path=await download.path();
  expect(path).toBeTruthy();
  const json=await readFile(path!,'utf8');
  const saved=JSON.parse(json);
  expect(saved.mode).toBe('quick');
  expect(saved.entries).toBe('Red\nGreen\nBlue');
  expect(saved.remove).toBe(true);
  await page.evaluate(()=>localStorage.clear());
  await page.goto('/');
  await page.locator('[data-role="setup-file"]').setInputFiles({
    name:'backup.json',mimeType:'application/json',buffer:Buffer.from(json)
  });
  await expect(page.locator('[data-role="entries"]')).toHaveValue('Red\nGreen\nBlue');
  await expect(page.locator('[data-role="remove"]')).toBeChecked();
  await expect(page.locator('[data-mode="quick"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('[data-role="feedback"]')).toContainText('Setup imported');
});

test('invalid setup JSON does not mutate the current round or candidate list',async({page})=>{
  await page.goto('/');
  const list=page.locator('[data-role="entries"]');
  await list.fill('One\nTwo\nThree');
  await page.waitForTimeout(240);
  await page.locator('[data-role="remove"]').check();
  await page.locator('[data-mode="quick"]').click();
  await page.locator('[data-action="pick"]').click();
  await expect(page.locator('[data-role="history"] .history-chip')).toHaveCount(1);
  await page.locator('[data-role="setup-file"]').setInputFiles({
    name:'broken.json',mimeType:'application/json',
    buffer:Buffer.from(JSON.stringify({type:'custom',entries:'',mode:'spin',remove:false}))
  });
  await expect(page.locator('[data-role="feedback"]')).toContainText('Setup JSON was not imported');
  await expect(list).toHaveValue('One\nTwo\nThree');
  await expect(page.locator('[data-role="history"] .history-chip')).toHaveCount(1);
  await expect(page.locator('[data-role="candidate-count"]')).toContainText('2 active choices');
});

test('share setup previews privacy and restores the selected Quick Pick mode',async({page,context})=>{
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto('/');
  await page.locator('[data-role="entries"]').fill('Team A\nTeam B\nTeam C');
  await page.locator('[data-mode="quick"]').click();
  await page.locator('[data-role="remove"]').check();
  await page.locator('[data-action="share"]').click();
  const dialog=page.locator('[data-role="share-preview"]');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-role="share-preview-summary"]')).toContainText('quick mode');
  await expect(dialog.locator('[data-role="share-preview-sample"]')).toContainText('3 custom entries');
  await expect(dialog.locator('[data-role="share-preview-warning"]')).toContainText('Anyone with the link can read custom choices');
  await dialog.locator('[data-action="confirm-share"]').click();
  const url=await page.evaluate(()=>navigator.clipboard.readText());
  expect(url).toContain('#wheel=');
  await page.goto(url);
  await expect(page.locator('[data-mode="quick"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('[data-role="remove"]')).toBeChecked();
});

test('oversized share setups are blocked with JSON export guidance',async({page})=>{
  await page.goto('/');
  const entries=Array.from({length:40},(_,i)=>'Choice '+i+' '+('x'.repeat(60))).join('\n');
  await page.locator('[data-role="entries"]').fill(entries);
  await page.waitForTimeout(240);
  await page.locator('[data-action="share"]').click();
  const dialog=page.locator('[data-role="share-preview"]');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-role="confirm-share"]')).toBeDisabled();
  await expect(dialog.locator('[data-role="share-preview-warning"]')).toContainText('Export setup JSON');
  await expect(page.locator('[data-action="export-setup"]')).toBeEnabled();
});
