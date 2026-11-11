
import {expect,test} from '@playwright/test';
test('preset 1–3 is immediately usable and non-repeating',async({page})=>{
  await page.goto('/random-number-wheel/1-3/');
  await expect(page.locator('h1')).toContainText('1 to 3');
  await expect(page.locator('[data-role=min]')).toHaveValue('1');
  await expect(page.locator('[data-role=max]')).toHaveValue('3');
  await page.locator('[data-role=remove]').check();
  const results = new Set<string>();
  for(let i=0;i<3;i++){
    await page.locator('[data-action=pick]').click();
    const text=(await page.locator('[data-role=result]').innerText()).trim();
    expect(['1','2','3']).toContain(text);
    expect(results.has(text)).toBe(false);
    results.add(text);
  }
  await page.locator('[data-action=pick]').click();
  await expect(page.locator('[data-role=feedback]')).toContainText('No choices remain');
  await page.locator('[data-action=reset]').click();
  await expect(page.locator('[data-role=candidate-count]')).toContainText('3 active');
});
test('large range uses a visual abstraction, not a tiny 10000-slice wheel',async({page})=>{
  await page.goto('/random-number-wheel/1-100/');
  await expect(page.locator('[data-role=wheel-wrap]')).toHaveClass(/is-abstract/);
  await page.locator('[data-role=max]').fill('10000');
  await page.locator('[data-role=max]').dispatchEvent('change');
  await page.locator('[data-action=pick]').click();
  const v=Number((await page.locator('[data-role=result]').innerText()).trim());
  expect(v).toBeGreaterThanOrEqual(1);expect(v).toBeLessThanOrEqual(10000);
});
test('landing pages have server-rendered copy and noindex until domain launch',async({request})=>{
  for(const range of ['1-3','1-4','1-5','1-6','1-20','1-100']){
    const response=await request.get('/random-number-wheel/'+range+'/');
    expect(response.status()).toBe(200);
    const html=await response.text();
    expect(html).toContain('name="description"');
    expect(html).toContain('noindex, nofollow');
    expect(html).toContain('How to pick');
  }
});
test('mobile layout has no horizontal overflow',async({page})=>{
  await page.setViewportSize({width:360,height:780});
  await page.goto('/random-number-wheel/1-5/');
  await expect(page.locator('[data-action=pick]')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)).toBe(false);
});
test('custom wheel renders user input as text, not markup',async({page})=>{
  await page.goto('/');
  await page.locator('[data-role=entries]').fill('<img src=x onerror=alert(1)> | 1\nOther | 1');
  await page.locator('[data-role=entries]').dispatchEvent('change');
  await expect(page.locator('img[src=x]')).toHaveCount(0);
  await page.locator('[data-mode=quick]').click();
  await page.locator('[data-action=pick]').click();
  await expect(page.locator('[data-role=result]')).not.toHaveText('Ready to pick');
});

test('new visual workspace keeps the wheel prominent and center action works',async({page})=>{
  await page.goto('/');
  await expect(page.locator('.stage .wheel-wrap')).toBeVisible();
  await expect(page.locator('.sidebar [data-role=entries]')).toBeVisible();
  await expect(page.locator('.wheel-center')).toBeVisible();
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('[data-action=center]').click();
  await expect(page.locator('[data-role=result]')).not.toHaveText('Ready when you are');
  await expect(page.locator('[data-action=center]')).toBeEnabled();
});

test('example chips change the wheel contents without a reload',async({page})=>{
  await page.goto('/');
  await page.locator('[data-template=yesno]').click();
  await expect(page.locator('[data-role=entries]')).toHaveValue('Yes\nNo');
  await expect(page.locator('[data-role=candidate-count]')).toContainText('2 active');
  await page.locator('[data-template=teams]').click();
  await expect(page.locator('[data-role=candidate-count]')).toContainText('4 active');
});

test('UI fits narrow phones without layout clipping',async({page})=>{
  for(const width of [320,360,390]){
    await page.setViewportSize({width,height:740});
    for(const path of ['/', '/random-number-wheel/1-100/']){
      await page.goto(path);
      const result=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,window:innerWidth,center:!!document.querySelector('[data-action=center]')}));
      expect(result.center).toBeTruthy();
      expect(result.scroll).toBeLessThanOrEqual(result.window+1);
    }
  }
});

test('local save restores edited entries on reload',async({page})=>{
  await page.goto('/');
  await page.locator('[data-role=entries]').fill('Alpha\nBeta\nGamma');
  await page.locator('[data-action=save]').click();
  await expect(page.locator('[data-role=feedback]')).toContainText('Setup saved');
  await page.reload();
  await expect(page.locator('[data-role=entries]')).toHaveValue('Alpha\nBeta\nGamma');
  await expect(page.locator('[data-role=candidate-count]')).toContainText('3 active');
});
test('editing the entry list previews new wheel choices without losing focus',async({page})=>{
  await page.goto('/');
  const entry=page.locator('[data-role=entries]');
  await entry.fill('One\nTwo');
  await expect(page.locator('[data-role=candidate-count]')).toContainText('2 active');
  await expect(entry).toBeFocused();
});

test('capture desktop and mobile visual QA views',async({page},testInfo)=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  await page.screenshot({path:testInfo.outputPath('desktop-home.png'),fullPage:true,animations:'disabled'});
  await page.setViewportSize({width:390,height:844});
  await page.reload();
  await page.screenshot({path:testInfo.outputPath('mobile-home.png'),fullPage:true,animations:'disabled'});
  await page.goto('/random-number-wheel/1-100/');
  await page.screenshot({path:testInfo.outputPath('mobile-numbers.png'),fullPage:true,animations:'disabled'});
});


test('Spin Studio has contrasting editorial wheel stage and working palettes',async({page})=>{
  await page.goto('/');
  await expect(page.locator('main .hero h1')).toContainText('Spin the wheel');
  await expect(page.locator('.rim-light')).toHaveCount(32);
  const stageColor=await page.locator('.stage').evaluate(el=>getComputedStyle(el).backgroundColor);
  expect(stageColor).toBe('rgb(23, 34, 57)');
  const oldGradient=await page.locator('[data-role="wheel-disc"]').evaluate(el=>getComputedStyle(el).backgroundImage);
  await page.locator('[data-palette=ocean]').click();
  await expect(page.locator('[data-palette=ocean]')).toHaveAttribute('aria-pressed','true');
  const newGradient=await page.locator('[data-role="wheel-disc"]').evaluate(el=>getComputedStyle(el).backgroundImage);
  expect(oldGradient).not.toBe(newGradient);
});

test('palette is included in local save and restored on reload',async({page})=>{
  await page.goto('/');
  await page.locator('[data-palette=candy]').click();
  await page.locator('[data-action=save]').click();
  await page.reload();
  await expect(page.locator('[data-palette=candy]')).toHaveAttribute('aria-pressed','true');
});

test('fullscreen studio can enter and exit without blocking the wheel',async({page})=>{
  await page.goto('/');
  await page.locator('[data-action=fullscreen]').click();
  await expect(page.locator('.stage')).toHaveCSS('position','fixed');
  await page.locator('[data-action=fullscreen]').click();
  await expect.poll(()=>page.evaluate(()=>Boolean(document.fullscreenElement))).toBe(false);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('[data-action=center]').click();
  await expect(page.locator('[data-role=result]')).not.toHaveText('Ready when you are');
});


test('brand colors use a cohesive pale-cobalt visual system',async({page})=>{
  await page.goto('/');
  // Browser-native calculated color; preserve these contrast anchors during future revisions.
  await expect(page.locator('.stage')).toHaveCSS('background-color','rgb(23, 34, 57)');
  await expect(page.locator('.primary').first()).toHaveCSS('background-color','rgb(220, 228, 255)');
  await expect(page.locator('[data-palette=sunset]')).toHaveAttribute('aria-label','Signature palette');
  await page.locator('[data-palette=ocean]').click();
  await expect(page.locator('[data-palette=ocean]')).toHaveAttribute('aria-pressed','true');
  await page.locator('[data-palette=candy]').click();
  await expect(page.locator('[data-palette=candy]')).toHaveAttribute('aria-pressed','true');
});


test('mobile results are legible and offer an edit shortcut',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  const jump=page.locator('.stage-edit-link');
  await expect(jump).toBeVisible();
  await expect(jump).toHaveAttribute('href','#wheel-settings');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('[data-action=center]').click();
  await expect(page.locator('.result-card')).toHaveClass(/is-picked/);
  await expect(page.locator('.history-chip')).toHaveCount(1);
  await page.locator('[data-action=reset]').click();
  await expect(page.locator('.result-card')).not.toHaveClass(/is-picked/);
  await expect(page.locator('.history-chip')).toHaveCount(0);
});

test('compact two-column mobile tool navigation has no horizontal overflow',async({page})=>{
  for(const width of [320,390]){
    await page.setViewportSize({width,height:844});
    await page.goto('/');
    const cols=await page.locator('.tool-grid').first().evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
    expect(cols).toBe(2);
    await expect(page.locator('.tool-grid .tool-card')).toHaveCount(13);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+1);
  }
});

test('Astro dev toolbar is disabled for screenshots and interactions',async({page})=>{
  await page.goto('/');
  await expect(page.locator('astro-dev-toolbar')).toHaveCount(0);
});


test('new P0 candidates have working first-load presets and remain noindex',async({request,page})=>{
  for(const [range,max] of [['1-2','2'],['1-8','8'],['1-10','10'],['1-50','50']]){
    const response=await request.get('/random-number-wheel/'+range+'/');
    expect(response.ok()).toBeTruthy();
    const html=await response.text();
    expect(html).toContain('noindex, nofollow');
    expect(html).toContain('name="description"');
    await page.goto('/random-number-wheel/'+range+'/');
    await expect(page.locator('[data-role=max]')).toHaveValue(max);
    await page.locator('[data-action=pick]').click();
    const n=Number(await page.locator('[data-role=result]').innerText());
    expect(n).toBeGreaterThanOrEqual(1);expect(n).toBeLessThanOrEqual(Number(max));
  }
});

test('batch 1–8 without replacement generates eight distinct numbers',async({page})=>{
  await page.goto('/random-number-wheel/1-8/');
  await page.locator('[data-role=batch]').fill('8');
  await page.locator('[data-role=remove]').check();
  await page.locator('[data-action=pick]').click();
  await expect(page.locator('[data-role=feedback]')).toContainText('Generated 8 secure results');
  await expect(page.locator('[data-role=candidate-count]')).toContainText('0 active');
  const chunks=await page.locator('.history-chip').allTextContents();
  expect(chunks).toHaveLength(8);
  expect(new Set(chunks).size).toBe(8);
  await page.locator('[data-action=pick]').click();
  await expect(page.locator('[data-role=feedback]')).toContainText('No choices remain');
  await page.locator('[data-action=reset]').click();
  await expect(page.locator('[data-role=candidate-count]')).toContainText('8 active');
});

test('invalid no-repeat batch is rejected before any draws',async({page})=>{
  await page.goto('/random-number-wheel/1-2/');
  await page.locator('[data-role=batch]').fill('3');
  await page.locator('[data-role=remove]').check();
  await page.locator('[data-action=pick]').click();
  await expect(page.locator('[data-role=feedback]')).toContainText('not enough remaining choices');
  await expect(page.locator('.history-chip')).toHaveCount(0);
});

test('results download as actual CSV and TXT',async({page})=>{
  await page.goto('/random-number-wheel/1-8/');
  await page.locator('[data-role=batch]').fill('8');
  await page.locator('[data-role=remove]').check();
  await page.locator('[data-action=pick]').click();
  const [csvDownload]=await Promise.all([page.waitForEvent('download'),page.locator('[data-action=export-csv]').click()]);
  expect(csvDownload.suggestedFilename()).toBe('wheelcanvas-results.csv');
  const [txtDownload]=await Promise.all([page.waitForEvent('download'),page.locator('[data-action=export-txt]').click()]);
  expect(txtDownload.suggestedFilename()).toBe('wheelcanvas-results.txt');
});

test('speed and saved number ranges stay isolated across presets',async({page})=>{
  await page.goto('/random-number-wheel/1-3/');
  await page.locator('[data-role=speed]').selectOption('fast');
  await page.locator('[data-action=save]').click();
  await page.reload();
  await expect(page.locator('[data-role=speed]')).toHaveValue('fast');
  await page.goto('/random-number-wheel/1-100/');
  await expect(page.locator('[data-role=speed]')).toHaveValue('normal');
  await expect(page.locator('[data-role=max]')).toHaveValue('100');
});

test('shuffle entries keeps all the same choices',async({page})=>{
  await page.goto('/');
  await page.locator('[data-role=entries]').fill('Alpha\nBeta\nGamma\nDelta');
  await page.locator('[data-action=shuffle]').click();
  const names=(await page.locator('[data-role=entries]').inputValue()).split('\n');
  expect(names.slice().sort()).toEqual(['Alpha','Beta','Delta','Gamma']);
  await expect(page.locator('[data-role=candidate-count]')).toContainText('4 active');
});


test('letter wheel begins with 26 genuinely labeled alphabet sectors and an excluded-letter filter',async({page,request})=>{
  const response=await request.get('/random-letter-wheel/');
  expect(response.status()).toBe(200);
  const html=await response.text();
  expect(html).toContain('noindex, nofollow');
  expect(html).toContain('<h1>Random Letter Wheel</h1>');
  await page.goto('/random-letter-wheel/');
  await expect(page.locator('[data-role=candidate-count]')).toContainText('26 active');
  await expect(page.locator('.wheel-label')).toHaveCount(26);
  await page.locator('[data-role=letter-set]').selectOption('vowels');
  await expect(page.locator('[data-role=candidate-count]')).toContainText('5 active');
  await page.locator('[data-role=letter-exclude]').fill('E, U');
  await expect(page.locator('[data-role=candidate-count]')).toContainText('3 active');
  await page.locator('[data-role=letter-case]').selectOption('lower');
  await expect(page.locator('.wheel-label')).toHaveText(['a','i','o']);
  await page.locator('[data-role=batch]').fill('3');
  await page.locator('[data-role=remove]').check();
  await page.locator('[data-action=pick]').click();
  const result=await page.locator('.history-chip').allTextContents();
  expect(result.sort()).toEqual(['a','i','o']);
  await expect(page.locator('[data-role=candidate-count]')).toContainText('0 active');
});

test('letter wheel reports when exclusions remove the entire alphabet',async({page})=>{
  await page.goto('/random-letter-wheel/');
  await page.locator('[data-role=letter-set]').selectOption('vowels');
  await page.locator('[data-role=letter-exclude]').fill('A E I O U');
  await expect(page.locator('[data-role=feedback]')).toContainText('No letters remain');
  await page.locator('[data-action=pick]').click();
  await expect(page.locator('.history-chip')).toHaveCount(0);
});

test('yes/no outcomes start with equal pair, then expand to equal triple',async({page,request})=>{
  const response=await request.get('/yes-or-no-wheel/');
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('noindex, nofollow');
  await page.goto('/yes-or-no-wheel/');
  await expect(page.locator('.wheel-label')).toHaveText(['Yes','No']);
  await page.locator('[data-role=decision-mode]').selectOption('yesnomaybe');
  await expect(page.locator('.wheel-label')).toHaveText(['Yes','No','Maybe']);
  await page.locator('[data-mode=quick]').click();
  await page.locator('[data-role=remove]').check();
  for(let i=0;i<3;i++)await page.locator('[data-action=pick]').click();
  const outcomes=await page.locator('.history-chip').allTextContents();
  expect(outcomes.sort()).toEqual(['Maybe','No','Yes']);
  await expect(page.locator('[data-role=candidate-count]')).toContainText('0 active');
});

test('letters and yes/no preferences are isolated from name and number wheels',async({page})=>{
  await page.goto('/random-letter-wheel/');
  await page.locator('[data-role=letter-set]').selectOption('consonants');
  await page.locator('[data-role=letter-exclude]').fill('Q, X, Z');
  await page.locator('[data-role=letter-case]').selectOption('lower');
  await page.locator('[data-action=save]').click();
  await page.reload();
  await expect(page.locator('[data-role=letter-set]')).toHaveValue('consonants');
  await expect(page.locator('[data-role=letter-exclude]')).toHaveValue('Q, X, Z');
  await expect(page.locator('[data-role=letter-case]')).toHaveValue('lower');
  await page.goto('/yes-or-no-wheel/');
  await expect(page.locator('[data-role=decision-mode]')).toHaveValue('yesno');
  await page.locator('[data-role=decision-mode]').selectOption('yesnomaybe');
  await page.locator('[data-action=save]').click();
  await page.reload();
  await expect(page.locator('[data-role=decision-mode]')).toHaveValue('yesnomaybe');
  await page.goto('/');
  await expect(page.locator('[data-role=entries]')).toContainText('Alex');
  await page.goto('/random-number-wheel/1-3/');
  await expect(page.locator('[data-role=max]')).toHaveValue('3');
});

test('new tool screens fit 320px and 390px widths',async({page})=>{
  for(const width of [320,390]){
    await page.setViewportSize({width,height:780});
    for(const path of ['/random-letter-wheel/','/yes-or-no-wheel/']){
      await page.goto(path);
      await expect(page.locator('[data-action=pick]')).toBeVisible();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+1);
    }
  }
});
