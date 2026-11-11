import {test,expect} from '@playwright/test';

test('1–2 page maps a fair number onto user-supplied options',async({page})=>{
  await page.goto('/random-number-wheel/1-2/');
  const task=page.locator('[data-number-task=two]');
  await expect(task).toBeVisible();
  await task.locator('[data-task=choice-a]').fill('Morning shift');
  await task.locator('[data-task=choice-b]').fill('Afternoon shift');
  await task.locator('[data-task=generate]').click();
  const summary=await task.locator('[data-task=summary]').innerText();
  expect(summary).toMatch(/Result: [12] — (Morning shift|Afternoon shift)/);
  await expect(task.locator('.task-result-row')).toHaveCount(1);
  const [download]=await Promise.all([page.waitForEvent('download'),task.locator('[data-task=export]').click()]);
  expect(download.suggestedFilename()).toBe('wheelcanvas-two-results.csv');
});
test('1–8 assigns eight teams to different numbered stations',async({page})=>{
  await page.goto('/random-number-wheel/1-8/');
  const task=page.locator('[data-number-task=stations]');
  await task.locator('[data-task=generate]').click();
  await expect(task.locator('.task-result-row')).toHaveCount(8);
  const numbers=await task.locator('.task-result-number').allTextContents();
  expect(new Set(numbers).size).toBe(8);
  await task.locator('[data-task=participants]').fill('One\nTwo\nThree');
  await expect(task.locator('[data-task=export]')).toBeDisabled();
  await task.locator('[data-task=generate]').click();
  await expect(task.locator('.task-result-row')).toHaveCount(3);
});
test('1–10 offers a genuine instant picker and a full, distinct order',async({page})=>{
  await page.goto('/random-number-wheel/1-10/');
  const task=page.locator('[data-number-task=ten]');
  await task.locator('[data-task=generate]').click();
  await expect(task.locator('.task-result-row')).toHaveCount(1);
  await task.locator('[data-task=full-order]').click();
  const numbers=await task.locator('.task-result-number').allTextContents();
  expect(numbers.length).toBe(10);
  expect(new Set(numbers).size).toBe(10);
});
test('1–15 creates a validated named participant order',async({page})=>{
  await page.goto('/random-number-wheel/1-15/');
  const task=page.locator('[data-number-task=roster]');
  await task.locator('[data-task=participants]').fill('Amy\nBob\nCory');
  await task.locator('[data-task=generate]').click();
  const labels=await task.locator('.task-result-label').allTextContents();
  expect(new Set(labels).size).toBe(3);
  expect(labels.slice().sort()).toEqual(['Amy','Bob','Cory']);
  await task.locator('[data-task=participants]').fill('Amy\namy');
  await task.locator('[data-task=generate]').click();
  await expect(task.locator('[data-task=status]')).toContainText('distinct');
});
test('1–30 supports exclusion and one-by-one attendance progress',async({page})=>{
  await page.goto('/random-number-wheel/1-30/');
  const task=page.locator('[data-number-task=attendance]');
  await task.locator('[data-task=absent]').fill('3, 12, 27');
  await task.locator('[data-task=generate]').click();
  await expect(task.locator('[data-task=summary]')).toContainText('27 present');
  await expect(task.locator('.task-result-row')).toHaveCount(0);
  await task.locator('[data-task=next]').click();
  await expect(task.locator('.task-result-row')).toHaveCount(1);
  const chosen=await task.locator('.task-result-number').innerText();
  expect(['3','12','27']).not.toContain(chosen);
  const [download]=await Promise.all([page.waitForEvent('download'),task.locator('[data-task=export]').click()]);
  expect(download.suggestedFilename()).toBe('wheelcanvas-attendance-results.csv');
});
test('1–1000 secure batch excludes out-of-pool values and reports uniqueness',async({page})=>{
  await page.goto('/random-number-wheel/1-1000/');
  const task=page.locator('[data-number-task=batch]');
  await task.locator('[data-task=count]').fill('80');
  await task.locator('[data-task=absent]').fill('11, 99');
  await task.locator('[data-task=generate]').click();
  const values=await task.locator('.task-result-number').allTextContents();
  expect(values.length).toBe(80);
  expect(new Set(values).size).toBe(80);
  expect(values.some(v=>['11','99'].includes(v))).toBe(false);
  await expect(task.locator('[data-task=summary]')).toContainText('80 unique');
  await task.locator('[data-task=count]').fill('101');
  await task.locator('[data-task=generate]').click();
  await expect(task.locator('[data-task=status]')).toContainText('Draw count');
  await expect(task.locator('[data-task=export]')).toBeDisabled();
});
test('letter wheel displays real classroom prompts and a usable optional timer',async({page})=>{
  await page.goto('/random-letter-wheel/');
  await page.locator('[data-mode=quick]').click();
  await page.locator('[data-action=pick]').click();
  const letter=(await page.locator('[data-role=result]').innerText()).trim();
  await expect(page.locator('[data-role=letter-challenge]')).toContainText('beginning with '+letter.toUpperCase());
  await page.locator('[data-role=letter-game-topic]').selectOption('food');
  await expect(page.locator('[data-role=letter-challenge]')).toContainText('food beginning with');
  await page.locator('[data-action=game-timer]').click();
  await expect(page.locator('[data-action=game-timer]')).toContainText('Stop timer');
  await page.locator('[data-action=game-timer]').click();
  await expect(page.locator('[data-role=game-clock]')).toHaveText('01:00');
});
test('Yes/No question is displayed locally and best-of-three tally stops at three',async({page})=>{
  await page.goto('/yes-or-no-wheel/');
  await page.locator('[data-role=question]').fill('Board game tonight?');
  await expect(page.locator('[data-role=question-display]')).toContainText('Board game tonight?');
  await page.locator('[data-role=best-of-three]').check();
  await page.locator('[data-mode=quick]').click();
  for(let i=0;i<3;i++){
    if(await page.locator('[data-action=pick]').isDisabled())break;
    await page.locator('[data-action=pick]').click();
  }
  await expect(page.locator('[data-role=round-status]')).toContainText('Best of 3 complete');
  await expect(page.locator('[data-action=pick]')).toBeDisabled();
  const totals=await page.locator('[data-tally]').allTextContents();
  const draws=totals.reduce((sum,v)=>sum+Number(v),0);
  expect(draws).toBeGreaterThanOrEqual(2);
  expect(draws).toBeLessThanOrEqual(3);
  await page.locator('[data-action=reset]').click();
  await expect(page.locator('[data-action=pick]')).toBeEnabled();
  expect((await page.locator('[data-tally]').allTextContents()).map(Number)).toEqual([0,0,0]);
});
test('Eight reviewed candidates are still explicitly noindex',async({request})=>{
  const paths=['/random-number-wheel/1-2/','/random-number-wheel/1-8/','/random-number-wheel/1-10/','/random-number-wheel/1-15/','/random-number-wheel/1-30/','/random-number-wheel/1-1000/','/random-letter-wheel/','/yes-or-no-wheel/'];
  for(const path of paths){
    const res=await request.get(path);
    expect(res.ok()).toBe(true);
    expect(await res.text()).toContain('noindex, nofollow');
  }
});
test('New candidate workflows fit 320px phones without horizontal clipping',async({page})=>{
  await page.setViewportSize({width:320,height:800});
  for(const path of ['/random-number-wheel/1-8/','/random-number-wheel/1-30/','/random-letter-wheel/','/yes-or-no-wheel/']){
    await page.goto(path);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(321);
  }
});

test('Maybe mode completes three draws and can report ties',async({page})=>{
  await page.goto('/yes-or-no-wheel/');
  await page.locator('[data-role=decision-mode]').selectOption('yesnomaybe');
  await page.locator('[data-role=best-of-three]').check();
  await page.locator('[data-mode=quick]').click();
  for(let i=0;i<3;i++)await page.locator('[data-action=pick]').click();
  await expect(page.locator('[data-role=round-status]')).toContainText('Three draws complete');
  await expect(page.locator('[data-action=pick]')).toBeDisabled();
  const total=(await page.locator('[data-tally]').allTextContents()).reduce((sum,x)=>sum+Number(x),0);
  expect(total).toBe(3);
});


test('visual QA evidence for station allocation and attendance widgets',async({page},testInfo)=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/random-number-wheel/1-8/');
  const station=page.locator('[data-number-task=stations]');
  await station.locator('[data-task=generate]').click();
  await station.screenshot({path:testInfo.outputPath('station-8-desktop.png'),animations:'disabled'});
  await page.goto('/random-number-wheel/1-30/');
  const attendance=page.locator('[data-number-task=attendance]');
  await attendance.locator('[data-absent-number="3"]').click();
  await attendance.locator('[data-absent-number="12"]').click();
  await attendance.locator('[data-task=generate]').click();
  await attendance.locator('[data-task=next]').click();
  await attendance.screenshot({path:testInfo.outputPath('roll-30-desktop.png'),animations:'disabled'});
  await page.setViewportSize({width:390,height:844});
  await page.goto('/random-number-wheel/1-8/');
  await page.locator('[data-number-task=stations] [data-task=generate]').click();
  await page.locator('[data-number-task=stations]').screenshot({path:testInfo.outputPath('station-8-mobile.png'),animations:'disabled'});
  await page.goto('/random-number-wheel/1-30/');
  await page.locator('[data-number-task=attendance] [data-absent-number="27"]').click();
  await page.locator('[data-number-task=attendance] [data-task=generate]').click();
  await page.locator('[data-number-task=attendance] [data-task=next]').click();
  await page.locator('[data-number-task=attendance]').screenshot({path:testInfo.outputPath('roll-30-mobile.png'),animations:'disabled'});
});
