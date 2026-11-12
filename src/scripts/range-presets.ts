/**
 * Apply a documented scenario to the existing number workbench.
 * Does not select a winner; a separate intentional click is required.
 */
type Preset = {min:number;max:number;batch:number;remove:boolean;exclude:string;mode:'quick'|'spin'};
function applyRangePreset(button:HTMLButtonElement){
  const root=document.querySelector<HTMLElement>('[data-wheel-app][data-kind="numbers"]');
  const guide=button.closest<HTMLElement>('[data-approved-range-guide]');
  const feedback=guide?.querySelector<HTMLElement>('[data-range-preset-feedback]');
  if(!root||!guide)return;
  const spinner=root.querySelector<HTMLButtonElement>('[data-action="pick"]');
  if(spinner?.disabled){
    if(feedback)feedback.textContent='Finish the current draw before changing the setup.';
    return;
  }
  let preset:Preset;
  try{
    preset=JSON.parse(button.dataset.rangePreset||'') as Preset;
    if(!Number.isSafeInteger(preset.min)||preset.min!==1
      ||!Number.isSafeInteger(preset.max)||String(preset.max)!==guide.dataset.approvedRangeGuide
      ||!Number.isSafeInteger(preset.batch)||preset.batch<1||preset.batch>100
      ||typeof preset.remove!=='boolean'||typeof preset.exclude!=='string'
      ||!['quick','spin'].includes(preset.mode))throw Error('Invalid preset.');
  }catch{
    if(feedback)feedback.textContent='Could not load this example. Use the wheel settings manually.';
    return;
  }
  const set=(role:string,value:string)=>{
    const input=root.querySelector<HTMLInputElement>('[data-role="'+role+'"]');
    if(!input)throw Error('Missing '+role);
    input.value=value;
    return input;
  };
  try{
    set('min',String(preset.min));
    set('max',String(preset.max));
    set('step','1');
    set('batch',String(preset.batch));
    const excluded=set('excluded',preset.exclude);
    const remove=root.querySelector<HTMLInputElement>('[data-role="remove"]');
    if(!remove)throw Error('Missing remove toggle');
    remove.checked=preset.remove;
    // The existing wheel controller owns all validation, reset and redraw logic.
    excluded.dispatchEvent(new Event('change',{bubbles:true}));
    root.querySelector<HTMLButtonElement>('[data-mode="'+preset.mode+'"]')?.click();
    if(feedback)feedback.textContent='Example settings loaded. Review the options, then choose Quick Pick or Spin to draw.';
    root.querySelector<HTMLElement>('#start')?.scrollIntoView({block:'start'});
  }catch{
    if(feedback)feedback.textContent='Could not apply this example. Please check the wheel settings.';
  }
}
document.querySelectorAll<HTMLButtonElement>('[data-range-preset]').forEach(button=>{
  button.addEventListener('click',()=>applyRangePreset(button));
});
