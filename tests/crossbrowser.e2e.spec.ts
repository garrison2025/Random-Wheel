
import {expect,test} from '@playwright/test';

test('custom wheel supports a secure quick pick, editing and reset',async({page})=>{
  await page.goto('/');
  await expect(page.locator('main .wheel-wrap')).toBeVisible();
  await page.locator('[data-role=entries]').fill('Alpha\nBeta\nGamma');
  await page.locator('[data-role=entries]').dispatchEvent('change');
  await page.locator('[data-mode=quick]').click();
  await page.locator('[data-action=center]').click();
  await expect(page.locator('[data-role=result]')).toContainText(/Alpha|Beta|Gamma/);
  await page.locator('[data-action=reset]').click();
  await expect(page.locator('[data-role=result]')).toHaveText('Ready when you are');
});

test('number preset renders correctly on narrow mobile and excludes unavailable numbers',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/random-number-wheel/1-20/');
  await expect(page.locator('[data-role=max]')).toHaveValue('20');
  await page.locator('[data-role=excluded]').fill('1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19');
  await page.locator('[data-role=excluded]').dispatchEvent('change');
  await page.locator('[data-action=pick]').click();
  await expect(page.locator('[data-role=result]')).toHaveText('20');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(391);
});

test('save and restore options without server-side accounts',async({page})=>{
  await page.goto('/');
  await page.locator('[data-role=entries]').fill('East\nWest');
  await page.locator('[data-action=save]').click();
  await page.reload();
  await expect(page.locator('[data-role=entries]')).toHaveValue('East\nWest');
});


test('letter tool can pick only vowels in all browser engines',async({page})=>{
  await page.goto('/random-letter-wheel/');
  await page.locator('[data-role=letter-set]').selectOption('vowels');
  await page.locator('[data-mode=quick]').click();
  await page.locator('[data-action=pick]').click();
  const choice=await page.locator('[data-role=result]').textContent();
  expect(['A','E','I','O','U']).toContain(choice);
});

test('yes/no tool can toggle to maybe and produce a valid instant draw',async({page})=>{
  await page.goto('/yes-or-no-wheel/');
  await page.locator('[data-role=decision-mode]').selectOption('yesnomaybe');
  await page.locator('[data-mode=quick]').click();
  await page.locator('[data-action=pick]').click();
  const choice=await page.locator('[data-role=result]').textContent();
  expect(['Yes','No','Maybe']).toContain(choice);
});


test('word wheel custom list and a curated group work across browsers',async({page})=>{
  await page.goto('/random-word-wheel/');
  await page.locator('[data-role=word-category]').selectOption('story');
  await expect(page.locator('[data-role=candidate-count]')).toContainText('12 active');
  await page.locator('[data-role=word-category]').selectOption('custom');
  await page.locator('[data-role=word-custom]').fill('Alpha\nBeta');
  await page.locator('[data-mode=quick]').click();
  await page.locator('[data-action=pick]').click();
  expect(['Alpha','Beta']).toContain((await page.locator('[data-role=result]').textContent())?.trim());
});


test('number workflow assignments are available in Firefox/WebKit too',async({page})=>{
  await page.goto('/random-number-wheel/1-8/');
  const task=page.locator('[data-number-task=stations]');
  await task.locator('[data-task=generate]').click();
  await expect(task.locator('.task-result-row')).toHaveCount(8);
});

test('Yes/No scores update in Firefox/WebKit too',async({page})=>{
  await page.goto('/yes-or-no-wheel/');
  await page.locator('[data-mode=quick]').click();
  await page.locator('[data-action=pick]').click();
  const values=await page.locator('[data-tally]').allTextContents();
  expect(values.reduce((a,b)=>a+Number(b),0)).toBe(1);
});


for (const motion of ['no-preference','reduce'] as const) {
  test('restoring a temporarily invalid list preserves the prior winning frame ('+motion+')',async({page})=>{
    await page.addInitScript(()=>{
      // The first 3-ticket draw picks C; the next 2-ticket draw picks A.
      Object.defineProperty(window.crypto,'getRandomValues',{
        configurable:true,
        value:(buffer:Uint32Array)=>{buffer.fill(2);return buffer;}
      });
    });
    await page.emulateMedia({reducedMotion:motion});
    await page.goto('/');
    const choices=page.locator('[data-role="entries"]');
    const disc=page.locator('[data-role="wheel-disc"]');
    await choices.fill('A\nB\nC');
    await choices.dispatchEvent('change');
    await page.locator('[data-role="remove"]').check();
    await page.locator('[data-role="speed"]').selectOption('fast');
    await page.locator('[data-action="pick"]').click();
    await expect(page.locator('[data-role="result"]')).toHaveText('C',{timeout:7000});
    const frame=await disc.evaluate(el=>({
      labels:[...el.querySelectorAll('.wheel-label')].map(label=>label.textContent),
      background:(el as HTMLElement).style.background,
      transform:(el as HTMLElement).style.transform
    }));
    expect(frame.labels).toEqual(['A','B','C']);
    expect(frame.transform).toMatch(/rotate\(/);
    await choices.fill('');
    await choices.dispatchEvent('change');
    await expect(page.locator('[data-role="feedback"]')).toContainText('Add 1–100 wheel entries');
    await expect(page.locator('[data-action="pick"]')).toBeDisabled();
    await choices.fill('A\nB\nC');
    await choices.dispatchEvent('change');
    await expect(page.locator('[data-role="feedback"]')).toContainText('Previous round restored');
    await expect(page.locator('[data-role="result"]')).toHaveText('C');
    await expect(page.locator('[data-role="candidate-count"]')).toContainText('2 choices remaining');
    await expect(page.locator('[data-role="wheel-overlay"]')).toHaveText('All eligible choices included');
    expect(await disc.evaluate(el=>({
      labels:[...el.querySelectorAll('.wheel-label')].map(label=>label.textContent),
      background:(el as HTMLElement).style.background,
      transform:(el as HTMLElement).style.transform
    }))).toEqual(frame);
    await page.locator('[data-action="pick"]').click();
    await expect(disc.locator('.wheel-label')).toHaveText(['A','B']);
    await expect(page.locator('[data-role="result"]')).toHaveText('A',{timeout:7000});
    await expect(page.locator('[data-role="history"] .history-chip')).toHaveText(['A','C']);
  });
}
