
import {numberChoices, parseExclusions, parseEntries, pickEntry, secureIndex, drawIndices, shuffleSecure, type Entry} from '../lib/random';
import {historyAsCsv,historyAsText} from '../lib/export';
import {letterChoices,yesNoChoices} from '../lib/choice-presets';
import {wordChoices} from '../lib/word-presets';
import {parseNumericRangeQuery} from '../lib/range-query';
import {parseImportedEntryLines} from '../lib/import-entries';

const PALETTES:Record<string,string[]>={
  // Existing palette ids are retained for previously shared links and saved configurations.
  sunset:['#726bc4','#72b3b3','#e7bda4','#7f9dc7','#c89dac','#b4c7ab','#a49bcf','#d3b879'],
  ocean:['#4c72aa','#8fc4bd','#9bbad8','#526a9d','#b4d4d0','#b2bde0','#80a7c7','#d1e3de'],
  candy:['#a28fb9','#dfb0b8','#c9a4ca','#b5bde3','#e2bfb1','#9fa6c6','#c1b5d1','#decabf']
};
let paletteName='sunset';
let COLORS=PALETTES.sunset!;
const MAX_HASH_LENGTH = 1700;
const get = <T extends Element>(root: ParentNode, selector: string): T | null => root.querySelector<T>(selector);
const asValue = (el: Element | null) => el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement ? el.value : '';
function init(root: HTMLElement) {
  const disc=get<HTMLElement>(root,'[data-role="wheel-disc"]')!;
  const wrap=get<HTMLElement>(root,'[data-role="wheel-wrap"]')!;
  const result=get<HTMLElement>(root,'[data-role="result"]')!;
  const instantResult=get<HTMLOutputElement>(root,'[data-role="instant-result"]');
  const instantCopy=get<HTMLButtonElement>(root,'[data-action="instant-copy"]');
  const instantCopyFeedback=get<HTMLElement>(root,'[data-role="instant-copy-feedback"]');
  const resultCard=get<HTMLElement>(root,'.result-card');
  const sparks=get<HTMLElement>(root,'[data-role="winner-sparks"]');
  const feedback=get<HTMLElement>(root,'[data-role="feedback"]')!;
  const history=get<HTMLElement>(root,'[data-role="history"]')!;
  const counter=get<HTMLElement>(root,'[data-role="candidate-count"]')!;
  const overlay=get<HTMLElement>(root,'[data-role="wheel-overlay"]')!;
  const pickButton=get<HTMLButtonElement>(root,'[data-action="pick"]')!;
  const resetButton=get<HTMLButtonElement>(root,'[data-action="reset"]')!;
  const centerButton=get<HTMLButtonElement>(root,'[data-action="center"]');
  const centerLabel=get<HTMLElement>(root,'[data-role="center-label"]');
  if(!disc || !wrap || !result || !feedback || !history || !counter || !overlay || !pickButton || !resetButton) return;
  const kind=root.dataset.kind;
  const isCustom=kind==='custom';
  const isLetters=kind==='letters';
  const isYesNo=kind==='yesno';
  const isWords=kind==='words';
  const isNumbers=kind==='numbers';
  wrap.classList.toggle('is-word-wheel',isWords);
  wrap.classList.toggle('is-letter-wheel',isLetters);
  let mode:'quick'|'spin'=isNumbers?'quick':'spin';
  let locked=false, rotation=0;
  let sparkTimer:number|undefined;
  let spinTimer:number|undefined;
  let drawGeneration=0;
  let importRequestId=0; // Only the newest chosen list file may update the wheel.
  let setupImportRequestId=0; // Ignore an older asynchronous JSON setup import.
  let pickedIndices = new Set<number>();
  let winningHistory:string[]=[];
  let latestDraw:string[]=[];
  let entries:Entry[]=[];
  let invalidDraft=false; // Invalid editor text pauses draws but must never discard the last valid round.
  // The applied selection policy must match the pool represented by pickedIndices.
  let appliedRemove=get<HTMLInputElement>(root,'[data-role="remove"]')?.checked ?? false;
  // Number presets must not inherit a custom range saved on a different URL.
  const savedKey='wheelcanvas.v1.'+(isCustom?'custom':isLetters?'letters':isYesNo?'yesno':isWords?'words':'numbers'+(location.pathname==='/random-number-wheel/'?'':'.'+location.pathname.replace(/[^a-z0-9]+/gi,'_')));
  const speedMs=()=>{
    const choice=asValue(get(root,'[data-role="speed"]'));
    return choice==='fast'?1600:choice==='slow'?5500:3600;
  };
  const applySpinSpeed=()=>{disc.style.transition='transform '+speedMs()+'ms cubic-bezier(.15,.85,.15,1)';};
  function setPalette(name:string){
    if(!Object.hasOwn(PALETTES,name) || !Array.isArray(PALETTES[name]))return;
    paletteName=name;
    COLORS=PALETTES[name]!;
    root.querySelectorAll<HTMLButtonElement>('[data-palette]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.palette===name)));
    render();
  }

  const status=(message:string,error=false)=>{ feedback.textContent=message;feedback.classList.toggle('error',error); };
  const clearSparks=()=>{
    window.clearTimeout(sparkTimer);
    sparks?.replaceChildren();
  };
  function celebrate(){
    if(!sparks || mode!=='spin' || matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    clearSparks();
    const pieces=document.createDocumentFragment();
    for(let i=0;i<14;i++){
      const part=document.createElement('span');
      part.className='winner-spark';
      const angle=(i*360/14)*Math.PI/180;
      const distance=85+(i%4)*24;
      part.style.setProperty('--dx',Math.round(Math.cos(angle)*distance)+'px');
      part.style.setProperty('--dy',Math.round(Math.sin(angle)*distance)+'px');
      part.style.setProperty('--turn',(180+i*53)+'deg');
      part.style.backgroundColor=COLORS[i%COLORS.length]!;
      part.style.animationDelay=(i%3*35)+'ms';
      pieces.append(part);
    }
    sparks.append(pieces);
    sparkTimer=window.setTimeout(clearSparks,1250);
  }
  const syncDrawAvailability=()=>{
    const disabled=locked||invalidDraft||root.dataset.roundComplete==='true';
    pickButton.disabled=disabled;
    const instantButton=get<HTMLButtonElement>(root,'[data-action="instant-pick"]');
    if(instantButton)instantButton.disabled=disabled;
    if(centerButton)centerButton.disabled=disabled;
  };
  const setBusy=(busy:boolean)=>{
    locked=busy;resetButton.disabled=busy;
    syncDrawAvailability();
    if(instantCopy)instantCopy.disabled=busy||latestDraw.length===0;
    root.querySelectorAll<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>('.sidebar input,.sidebar textarea,.sidebar select').forEach(el=>{el.disabled=busy;});
    root.querySelectorAll<HTMLButtonElement>('.sidebar button').forEach(el=>{
      // Clear saved only removes the local config and is safe during a spin.
      el.disabled=busy && el.dataset.action!=='clear';
    });
  };
  const updateModeLabels=()=>{
    const quantity=Number(asValue(get(root,'[data-role="batch"]')));
    const batch=(isNumbers||isLetters||isWords) && Number.isSafeInteger(quantity) && quantity>1 && quantity<=100;
    const plural=isNumbers?'numbers':isLetters?'letters':'words';
    pickButton.textContent=batch?'⚡ Pick '+quantity+' '+plural:mode==='quick'?'⚡ Pick instantly':'✳ Spin the wheel';
    if(centerLabel) centerLabel.textContent=batch||mode==='quick'?'PICK':'SPIN';
    if(centerButton)centerButton.setAttribute('aria-label',batch?'Pick '+quantity+' '+plural:mode==='quick'?'Pick a random result':'Spin the wheel');
  };
  const readChoices=():Entry[]=>{
    if(isCustom) return parseEntries(asValue(get(root,'[data-role="entries"]')));
    if(isLetters)return letterChoices(
      asValue(get(root,'[data-role="letter-set"]')),
      asValue(get(root,'[data-role="letter-exclude"]')),
      asValue(get(root,'[data-role="letter-case"]'))
    );
    if(isYesNo)return yesNoChoices(asValue(get(root,'[data-role="decision-mode"]')));
    if(isWords)return wordChoices(asValue(get(root,'[data-role="word-category"]')),asValue(get(root,'[data-role="word-custom"]')));
    const requiredNumber=(key:'min'|'max'|'step')=>{
      const raw=asValue(get(root,'[data-role="'+key+'"]')).trim();
      if(!raw)throw new RangeError('Enter a value for '+key+' before drawing.');
      const n=Number(raw);
      if(!Number.isSafeInteger(n))throw new RangeError(key+' must be a whole number.');
      return n;
    };
    const min=requiredNumber('min');
    const max=requiredNumber('max');
    const step=requiredNumber('step');
    return numberChoices(min,max,step,parseExclusions(asValue(get(root,'[data-role="excluded"]')))).map(n=>({label:String(n),weight:1}));
  };
  function renderHistory() {
    history.textContent='';
    if (!winningHistory.length) {history.textContent='Your recent picks will appear here.';return;}
    const title=document.createElement('strong');
    title.className='history-title';
    title.textContent='Recent picks';
    history.append(title);
    for(const item of winningHistory.slice(0,8)){
      const chip=document.createElement('span');
      chip.className='history-chip';
      chip.textContent=item;
      history.append(chip);
    }
    if(winningHistory.length>8){
      const more=document.createElement('span');
      more.className='history-more';
      more.textContent='+'+(winningHistory.length-8)+' more';
      history.append(more);
    }
  }
  const reset=(message='New round ready.')=>{
    drawGeneration++;
    window.clearTimeout(spinTimer);spinTimer=undefined;setBusy(false);
    pickedIndices=new Set();winningHistory=[];latestDraw=[];
    if(instantCopy)instantCopy.disabled=true;
    if(instantCopyFeedback)instantCopyFeedback.textContent='';
    clearSparks();
    result.textContent='Ready when you are';
    if(instantResult)instantResult.textContent='—';
    resultCard?.classList.remove('is-picked');
    renderHistory();status(invalidDraft?'Round reset. Fix settings before drawing.':message,invalidDraft);
    root.dispatchEvent(new CustomEvent('wheelcanvas:reset'));
    disc.style.transition='none';disc.style.transform='rotate(0deg)';rotation=0;
    render();void disc.offsetWidth;applySpinSpeed();
  };
  function activeChoices(){
    const remove=get<HTMLInputElement>(root,'[data-role="remove"]')?.checked ?? false;
    return entries.map((entry,index)=>({entry,index})).filter(v=>v.entry.weight>0 && (!remove || !pickedIndices.has(v.index)));
  }
  function renderProbabilities(){
    const list=get<HTMLOListElement>(root,'[data-role="probability-list"]');
    const caption=get<HTMLElement>(root,'[data-role="probability-caption"]');
    if(!list || !caption)return;
    const active=activeChoices();
    const total=active.reduce((sum,v)=>sum+v.entry.weight,0);
    list.replaceChildren();
    if(!active.length){
      caption.textContent='No eligible tickets remain. Start over to begin a new round.';
      return;
    }
    if(invalidDraft){
      caption.textContent='The draft is invalid. The last valid pool and no-repeat history are preserved; drawing is paused.';
    }else if(active.length>100 && active.every(v=>v.entry.weight===active[0]!.entry.weight)){
      caption.textContent=active.length+' eligible tickets · equal chance: '+(100/active.length).toFixed(4)+'% each. The simplified wheel is decorative; every eligible ticket remains in the draw.';
      return;
    }else if(active.length>100){
      caption.textContent='Showing the first 100 of '+active.length+' eligible tickets. Probabilities are calculated against the full active pool.';
    }else{
      caption.textContent=active.length+' eligible tickets · exact chance per ticket, recalculated after each no-repeat draw.';
    }
    active.slice(0,100).forEach(({entry,index})=>{
      const item=document.createElement('li');
      // Duplicate names are independent tickets; show their original ticket indices.
      const percentage=(entry.weight/total*100).toFixed(2);
      item.textContent='#'+(index+1)+' '+entry.label+' — weight '+entry.weight+' · '+percentage+'%';
      list.append(item);
    });
  }
  function render(){
    const active=activeChoices();
    renderProbabilities();
    const total=active.reduce((s,a)=>s+a.entry.weight,0);
    counter.textContent=active.length + (active.length===1?' active choice':' active choices');
    disc.textContent='';
    const abstract=active.length>36;
    wrap.classList.toggle('is-abstract',abstract);
    if (!active.length) {
      disc.style.background='#dce1f1';overlay.textContent='No available choices';
      if(invalidDraft){counter.textContent='Fix settings to continue';overlay.textContent='Invalid settings · round paused';}
      return;
    }
    if(abstract){
      const bands=12;
      disc.style.background='conic-gradient('+Array.from({length:bands},(_,i)=>COLORS[i%COLORS.length]+' '+(i*100/bands)+'% '+((i+1)*100/bands)+'%').join(',')+')';
      overlay.textContent=active.length+' eligible choices · decorative display only';
      if(invalidDraft){counter.textContent='Fix settings to continue';overlay.textContent='Invalid settings · round paused';}
      return;
    }
    // Restore a valid label after an empty or simplified candidate pool.
    overlay.textContent=isNumbers?'All eligible numbers included':'All eligible choices included';
    let degree=0;
    const stops:string[]=[];
    for(let i=0;i<active.length;i++){
      const size=active[i]!.entry.weight/total*360;
      const start=degree;degree+=size;
      stops.push(COLORS[i%COLORS.length]+' '+start.toFixed(6)+'deg '+degree.toFixed(6)+'deg');
      if(active.length<=12 || (isLetters && active.length<=26) || (isWords && active.length<=16)){
        const at=(start+size/2)*Math.PI/180;
        const label=document.createElement('span');
        label.className='wheel-label';
        label.textContent=active[i]!.entry.label;
        const color=COLORS[i%COLORS.length]!;
        const r=parseInt(color.slice(1,3),16)/255,g=parseInt(color.slice(3,5),16)/255,b=parseInt(color.slice(5,7),16)/255;
        const luminance=[r,g,b].map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);
        const light=0.2126*luminance[0]!+0.7152*luminance[1]!+0.0722*luminance[2]!;
        label.style.color=light>0.22?'#17243b':'#ffffff';
        label.style.textShadow=light>0.26?'0 1px 2px #ffffff55':'0 1px 3px #14213b99';
        const radius=(isLetters || isWords) && active.length>12 ? 37 : 32;
        label.style.left=(50+Math.sin(at)*radius)+'%';
        label.style.top=(50-Math.cos(at)*radius)+'%';
        disc.append(label);
      }
    }
    disc.style.background='conic-gradient('+stops.join(',')+')';
    if(invalidDraft){counter.textContent='Fix settings to continue';overlay.textContent='Invalid settings · round paused';}
  }
  function refresh(){
    if(isWords){
      const controls=get<HTMLElement>(root,'[data-role="word-custom-controls"]');
      const category=get<HTMLSelectElement>(root,'[data-role="word-category"]');
      if(controls)controls.hidden=category?.value!=='custom';
    }
    const wasInvalid=invalidDraft;
    try {
      const next=readChoices();
      if(!next.some(e=>e.weight>0))throw new Error('At least one choice must have a positive weight.');
      const remove=get<HTMLInputElement>(root,'[data-role="remove"]')?.checked ?? false;
      const changed=entries.length!==next.length || entries.some((entry,i)=>
        entry.label!==next[i]?.label || entry.weight!==next[i]?.weight
      );
      const removalChanged=appliedRemove!==remove;
      entries=next;
      appliedRemove=remove;
      invalidDraft=false;
      syncDrawAvailability();
      // Editing a valid pool starts a new round; correcting an invalid draft
      // back to the identical pool resumes every already-picked ticket.
      if(changed || removalChanged)reset('Ready to draw.');
      else if(wasInvalid){
        render();
        status('Previous round restored. Unpicked entries are still available.');
      }
      return true;
    } catch(error) {
      // Do not destroy the last valid pool or the no-repeat ledger. Merely
      // suspend new draws until the user fixes the draft input.
      invalidDraft=true;
      syncDrawAvailability();
      counter.textContent='Fix settings to continue';
      overlay.textContent='Invalid settings · round paused';
      const probabilityCaption=get<HTMLElement>(root,'[data-role="probability-caption"]');
      if(probabilityCaption)probabilityCaption.textContent='The draft is invalid. Your last valid candidate pool and no-repeat history are preserved; drawing is paused.';
      status(error instanceof Error?error.message:'Invalid choices.',true);
      return false;
    }
  }
  function showWinner(label:string,index:number){
    winningHistory.unshift(label);if(winningHistory.length>1000)winningHistory.pop();
    latestDraw=[label];
    if(instantCopyFeedback)instantCopyFeedback.textContent='';
    result.textContent=label;
    if(instantResult)instantResult.textContent=label;
    resultCard?.classList.remove('is-picked');
    // Restart a subtle reveal animation for successive draws.
    void resultCard?.offsetWidth;
    resultCard?.classList.add('is-picked');
    const removeWinner=get<HTMLInputElement>(root,'[data-role="remove"]')?.checked ?? false;
    if(removeWinner) pickedIndices.add(index);
    renderHistory();status('Draw completed with browser-based secure randomness.');
    celebrate();
    // Hold the selected segment at the pointer until the next spin, then paint the remaining entries.
    if(mode==='quick' || !removeWinner) render();
    else {
      counter.textContent=activeChoices().length+' choices remaining';
      renderProbabilities();
    }
    setBusy(false);
    root.dispatchEvent(new CustomEvent('wheelcanvas:result',{detail:{label}}));
  }
  function pick(){
    if(locked || root.dataset.roundComplete==='true') return;
    // An uncommitted edit changes which index represents which ticket.
    // Apply it and reset the old winner indices BEFORE selecting a result.
    if(!flushPendingEdit())return;
    if(invalidDraft && !refresh())return;
    try{
      entries=readChoices();
      const active=activeChoices();
      if(!active.length) throw new Error('No choices remain. Reset the round or change your settings.');
      if(mode==='spin' && pickedIndices.size && get<HTMLInputElement>(root,'[data-role="remove"]')?.checked){
        disc.style.transition='none';disc.style.transform='rotate(0deg)';rotation=0;
        render();void disc.offsetWidth;applySpinSpeed();
      }
      const batchText=(isNumbers || isLetters || isWords) ? asValue(get(root,'[data-role="batch"]')).trim() : '1';
      if(!batchText)throw new RangeError('Enter how many results to draw (1–100).');
      const requested=Number(batchText);
      if(!Number.isSafeInteger(requested)||requested<1||requested>100) throw new RangeError('Choose 1–100 results per draw.');
      if(requested>1) {
        const noRepeat=get<HTMLInputElement>(root,'[data-role="remove"]')?.checked ?? false;
        const drawn=drawIndices(active.map(a=>a.entry),requested,noRepeat);
        const values=drawn.map(i=>active[i]!.entry.label);
        latestDraw=values;
        if(instantCopy)instantCopy.disabled=false;
        if(instantCopyFeedback)instantCopyFeedback.textContent='';
        if(noRepeat) for(const i of drawn) pickedIndices.add(active[i]!.index);
        for(const label of values) winningHistory.unshift(label);
        winningHistory=winningHistory.slice(0,1000);
        clearSparks();
        resultCard?.classList.remove('is-picked');
        result.textContent=values.length<=7 ? values.join(' · ') : values.slice(0,7).join(' · ')+' … (+'+(values.length-7)+')';
        if(instantResult)instantResult.textContent=result.textContent;
        resultCard?.classList.add('is-picked');
        renderHistory();render();
        status('Generated '+values.length+' secure results'+(noRepeat?' without repeats.':'.')+' Export CSV or TXT for the full history.');
        root.dispatchEvent(new CustomEvent('wheelcanvas:result',{detail:{label:values[0],labels:values}}));
        return;
      }
      const selected=pickEntry(active.map(a=>a.entry));
      const chosen=active[selected]!;
      setBusy(true);
      resultCard?.classList.remove('is-picked');
      result.textContent=mode==='spin'?'Spinning…':'Picking…';
      status(mode==='spin'?'Spinning…':'Picking…');
      if(mode==='quick'){
        showWinner(chosen.entry.label,chosen.index);
        return;
      }
      const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
      const abstract=active.length>36;
      let landing:number;
      if (abstract) landing=secureIndex(360);
      else {
        const total=active.reduce((n,e)=>n+e.entry.weight,0);
        const start=active.slice(0,selected).reduce((n,e)=>n+e.entry.weight,0)/total*360;
        const width=chosen.entry.weight/total*360;
        landing=(360-(start+width/2)%360)%360;
      }
      if(reducedMotion){
        // Use the same sampled winning sector as animated spin, but reposition
        // instantly. Never leave the pointer on a different visible choice.
        rotation=landing;
        disc.style.transition='none';
        disc.style.transform='rotate('+landing+'deg)';
        showWinner(chosen.entry.label,chosen.index);
        return;
      }
      const current=((rotation%360)+360)%360;
      const delta=(landing-current+360)%360;
      rotation += (5+secureIndex(3))*360+delta;
      disc.style.transform='rotate('+rotation+'deg)';
      const generation=drawGeneration;
      spinTimer=window.setTimeout(()=>{
        if(generation!==drawGeneration)return;
        spinTimer=undefined;
        showWinner(chosen.entry.label,chosen.index);
      },speedMs()+50);
    } catch(error){
      setBusy(false);
      status(error instanceof Error?error.message:'Random selection failed.',true);
      if(instantResult)instantResult.textContent='Check settings';
    }
  }

  root.querySelectorAll<HTMLButtonElement>('[data-palette]').forEach(button=>button.addEventListener('click',()=>{
    if(!locked){setPalette(button.dataset.palette||'sunset');status('New colors applied. Ready to spin.');}
  }));
  const fullscreenButton=get<HTMLButtonElement>(root,'[data-action="fullscreen"]');
  const stage=get<HTMLElement>(root,'.stage');
  fullscreenButton?.addEventListener('click',async()=>{
    try{
      if(document.fullscreenElement)await document.exitFullscreen();
      else if(stage)await stage.requestFullscreen();
    }catch{status('Fullscreen is not supported here.',true);}
  });
  document.addEventListener('fullscreenchange',()=>{
    if(fullscreenButton) fullscreenButton.setAttribute('aria-label',document.fullscreenElement?'Exit fullscreen':'Toggle fullscreen wheel');
  });
  get<HTMLInputElement>(root,'[data-role="batch"]')?.addEventListener('input',updateModeLabels);
  root.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button=>button.addEventListener('click',()=>{
    if(locked)return;
    mode=button.dataset.mode==='spin'?'spin':'quick';
    root.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    updateModeLabels();
    status(mode==='quick'?'Instant result mode selected.':'Animated wheel mode selected.');
  }));
  pickButton.addEventListener('click',pick);
  get<HTMLButtonElement>(root,'[data-action="instant-pick"]')?.addEventListener('click',()=>{
    if(locked || root.dataset.roundComplete==='true')return;
    // Use the same secure sampling and result path as the regular Quick Pick.
    root.querySelector<HTMLButtonElement>('[data-mode="quick"]')?.click();
    pick();
  });
  centerButton?.addEventListener('click',pick);
  // A horizontal swipe on the wheel triggers a single draw. Vertical
  // gestures are left to the browser for normal scrolling on mobile.
  let swipeStart:{id:number;x:number;y:number;at:number}|null=null;
  wrap.addEventListener('pointerdown',event=>{
    if(locked || root.dataset.roundComplete==='true' || event.pointerType!=='touch' || (event.target as Element).closest('button'))return;
    if(event.isPrimary===false)return;
    swipeStart={id:event.pointerId,x:event.clientX,y:event.clientY,at:performance.now()};
  });
  wrap.addEventListener('pointerup',event=>{
    const start=swipeStart;
    swipeStart=null;
    if(!start || event.pointerId!==start.id || locked || root.dataset.roundComplete==='true')return;
    const dx=event.clientX-start.x,dy=event.clientY-start.y;
    if(Math.abs(dx)>=48 && Math.abs(dx)>Math.abs(dy)*1.3 && performance.now()-start.at<=1250){
      pick();
    }
  });
  wrap.addEventListener('pointercancel',()=>{swipeStart=null;});
  const templates:Record<string,string>={
    teams:'Team A\nTeam B\nTeam C\nTeam D',
    lunch:'Pizza\nSushi\nTacos\nPasta\nBurgers\nSalad',
    yesno:'Yes\nNo'
  };
  root.querySelectorAll<HTMLButtonElement>('[data-template]').forEach(button=>{
    button.addEventListener('click',()=>{
      if(locked)return;
      const preset=templates[button.dataset.template||''];
      const target=get<HTMLTextAreaElement>(root,'[data-role="entries"]');
      if(target&&preset){target.value=preset;refresh();status('Example loaded. Edit any choice, then spin.');}
    });
  });
  resetButton.addEventListener('click',()=>{if(!locked)reset();});
  get<HTMLSelectElement>(root,'[data-role="speed"]')?.addEventListener('change',()=>{
    if(!locked){applySpinSpeed();status('Spin duration updated.');}
  });
  get<HTMLButtonElement>(root,'[data-action="shuffle"]')?.addEventListener('click',()=>{
    if(locked)return;
    const textarea=get<HTMLTextAreaElement>(root,isWords?'[data-role="word-custom"]':'[data-role="entries"]');
    if(!textarea)return;
    const lines=textarea.value.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
    if(lines.length<2){status('Add at least two entries to shuffle.',true);return;}
    try{
      textarea.value=shuffleSecure(lines).join('\n');
      if(isWords){
        const category=get<HTMLSelectElement>(root,'[data-role="word-category"]');
        if(category)category.value='custom';
      }
      refresh();status('Choices securely shuffled.');
    }
    catch(error){status(error instanceof Error?error.message:'Could not shuffle entries.',true);}
  });
  function downloadResults(type:'csv'|'txt'){
    if(!winningHistory.length){status('Draw a result before exporting.');return;}
    const ordered=[...winningHistory].reverse();
    const content=type==='csv'?historyAsCsv(ordered):historyAsText(ordered);
    const blob=new Blob([content],{type:type==='csv'?'text/csv;charset=utf-8':'text/plain;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const link=document.createElement('a');
    link.href=url;link.download='number-spinner-results.'+type;
    document.body.append(link);link.click();link.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),5000);
    status('Results exported to '+type.toUpperCase()+'.');
  }
  root.querySelectorAll<HTMLButtonElement>('[data-action="export-csv"],[data-action="export-txt"]').forEach(button=>button.addEventListener('click',()=>{
    downloadResults(button.dataset.action==='export-csv'?'csv':'txt');
  }));
  let editTimer:number|undefined;
  function flushPendingEdit():boolean{
    if(editTimer===undefined)return true;
    window.clearTimeout(editTimer);
    editTimer=undefined;
    return refresh();
  }
  root.querySelectorAll<HTMLInputElement|HTMLTextAreaElement>('[data-role="min"],[data-role="max"],[data-role="step"],[data-role="excluded"],[data-role="entries"],[data-role="letter-exclude"],[data-role="word-custom"]')
    .forEach(el=>{
      el.addEventListener('input',()=>{
        if(locked)return;
        // Direct typing supersedes any pending asynchronous file import.
        if(el.matches('[data-role="entries"],[data-role="word-custom"]'))importRequestId++;
        window.clearTimeout(editTimer);
        editTimer=window.setTimeout(()=>{editTimer=undefined;refresh();},180);
      });
      el.addEventListener('change',()=>{
        window.clearTimeout(editTimer);editTimer=undefined;
        if(!locked)refresh();
      });
    });
  get<HTMLTextAreaElement>(root,'[data-role="word-custom"]')?.addEventListener('input',()=>{
    if(locked)return;
    const category=get<HTMLSelectElement>(root,'[data-role="word-category"]');
    if(category && category.value!=='custom'){category.value='custom';}
  });
  get<HTMLInputElement>(root,'[data-role="remove"]')?.addEventListener('change',()=>{
    if(locked)return;
    appliedRemove=get<HTMLInputElement>(root,'[data-role="remove"]')?.checked ?? false;
    reset('Removal setting changed; started a fresh round.');
  });
  root.querySelectorAll<HTMLSelectElement>('[data-role="letter-set"],[data-role="letter-case"],[data-role="decision-mode"],[data-role="word-category"]')
    .forEach(el=>el.addEventListener('change',()=>{if(!locked)refresh();}));
  get<HTMLInputElement>(root,'[data-role="file"]')?.addEventListener('change',async event=>{
    if(locked)return;
    const requestId=++importRequestId;
    const file=(event.currentTarget as HTMLInputElement).files?.[0];
    if(!file)return;
    const generation=drawGeneration;
    if(file.size>50000){status('Choose a file under 50 KB.',true);return;}
    try {
      const text=await file.text();
      if(locked || generation!==drawGeneration || requestId!==importRequestId)return; // Ignore superseded imports.
      const hasHeaderRow=get<HTMLInputElement>(root,'[data-role="csv-has-header"]')?.checked ?? false;
      const lines=parseImportedEntryLines(text,file.name,hasHeaderRow);
      const target=get<HTMLTextAreaElement>(root,isWords?'[data-role="word-custom"]':'[data-role="entries"]');
      if(target){
        target.value=lines.join('\n');
        if(isWords){
          const category=get<HTMLSelectElement>(root,'[data-role="word-category"]');
          if(category)category.value='custom';
        }
        refresh();
      }
    } catch(error){
      if(generation===drawGeneration && requestId===importRequestId)
        status(error instanceof Error?error.message:'Could not read the file.',true);
    }
  });
  instantCopy?.addEventListener('click',async()=>{
    if(!latestDraw.length){
      if(instantCopyFeedback)instantCopyFeedback.textContent='Generate a result first.';
      return;
    }
    try{
      await navigator.clipboard.writeText(latestDraw.join('\n'));
      if(instantCopyFeedback)instantCopyFeedback.textContent=latestDraw.length===1?'Number copied.':'Latest batch copied.';
    }catch{
      if(instantCopyFeedback)instantCopyFeedback.textContent='Clipboard unavailable. You can select and copy the result.';
    }
  });
  get<HTMLButtonElement>(root,'[data-action="copy"]')?.addEventListener('click',async()=>{
    if(!winningHistory.length){status('Draw a result first.');return;}
    try{await navigator.clipboard.writeText(winningHistory.join('\n'));status('Results copied.');}
    catch{status('Copy is unavailable. Select the history and copy manually.',true);}
  });
  function config(){
    const shared={palette:paletteName,speed:asValue(get(root,'[data-role="speed"]')),remove:get<HTMLInputElement>(root,'[data-role="remove"]')?.checked ?? false,mode};
    if(isCustom)return {type:'custom',...shared,entries:asValue(get(root,'[data-role="entries"]'))};
    if(isLetters)return {type:'letters',...shared,letterSet:asValue(get(root,'[data-role="letter-set"]')),letterCase:asValue(get(root,'[data-role="letter-case"]')),letterExclude:asValue(get(root,'[data-role="letter-exclude"]')),batch:asValue(get(root,'[data-role="batch"]'))};
    if(isYesNo)return {type:'yesno',...shared,decisionMode:asValue(get(root,'[data-role="decision-mode"]'))};
    if(isWords)return {type:'words',...shared,wordCategory:asValue(get(root,'[data-role="word-category"]')),wordCustom:asValue(get(root,'[data-role="word-custom"]')),batch:asValue(get(root,'[data-role="batch"]'))};
    return {type:'numbers',...shared,batch:asValue(get(root,'[data-role="batch"]')),min:asValue(get(root,'[data-role="min"]')),max:asValue(get(root,'[data-role="max"]')),step:asValue(get(root,'[data-role="step"]')),excluded:asValue(get(root,'[data-role="excluded"]'))};
  }
  function validateConfigValue(value:unknown):Record<string,unknown>{
    if(!value || typeof value!=='object' || Array.isArray(value))throw new Error('Invalid setup file.');
    const c=value as Record<string,unknown>;
    const expected=isCustom?'custom':isLetters?'letters':isYesNo?'yesno':isWords?'words':'numbers';
    if(c.type!==expected)throw new Error('The setup is for a different tool.');
    if(c.remove!==undefined && typeof c.remove!=='boolean')throw new Error('Invalid removal setting in setup.');
    if(c.mode!==undefined && c.mode!=='spin' && c.mode!=='quick')throw new Error('Invalid draw mode in setup.');
    const palette=c.palette===undefined?paletteName:c.palette;
    if(typeof palette!=='string' || !Object.hasOwn(PALETTES,palette))throw new Error('Choose a valid wheel palette in the setup.');
    const speed=c.speed===undefined?asValue(get(root,'[data-role="speed"]')):c.speed;
    if(typeof speed!=='string' || !['fast','normal','slow'].includes(speed))throw new Error('Choose a valid spin duration in the setup.');
    const text=(key:string,selector:string)=>{
      const candidate=c[key]===undefined?asValue(get(root,selector)):c[key];
      if(typeof candidate!=='string' || candidate.length>=12000)throw new Error('Invalid '+key+' value in setup.');
      return candidate;
    };
    let candidate:Entry[];
    if(isCustom){
      candidate=parseEntries(text('entries','[data-role="entries"]'));
    }else if(isLetters){
      candidate=letterChoices(
        text('letterSet','[data-role="letter-set"]'),
        text('letterExclude','[data-role="letter-exclude"]'),
        text('letterCase','[data-role="letter-case"]')
      );
    }else if(isYesNo){
      candidate=yesNoChoices(text('decisionMode','[data-role="decision-mode"]'));
    }else if(isWords){
      candidate=wordChoices(
        text('wordCategory','[data-role="word-category"]'),
        text('wordCustom','[data-role="word-custom"]')
      );
    }else{
      const minText=text('min','[data-role="min"]');
      const maxText=text('max','[data-role="max"]');
      const stepText=text('step','[data-role="step"]');
      const min=Number(minText),max=Number(maxText),step=Number(stepText);
      if(![min,max,step].every(Number.isSafeInteger))throw new Error('Number range values must be safe whole numbers.');
      candidate=numberChoices(min,max,step,parseExclusions(text('excluded','[data-role="excluded"]')))
        .map(number=>({label:String(number),weight:1}));
    }
    const eligible=candidate.filter(entry=>entry.weight>0).length;
    if(!eligible)throw new Error('The setup contains no eligible choices.');
    const remove=c.remove===undefined?(get<HTMLInputElement>(root,'[data-role="remove"]')?.checked??false):c.remove;
    const hasBatch=isNumbers||isLetters||isWords;
    const batchValue=hasBatch?(c.batch===undefined?asValue(get(root,'[data-role="batch"]')):c.batch):'1';
    if(typeof batchValue!=='string' || !batchValue.trim() || !Number.isSafeInteger(Number(batchValue)) || Number(batchValue)<1 || Number(batchValue)>100)
      throw new Error('Invalid batch size in setup.');
    if(remove && Number(batchValue)>eligible)throw new Error('Not enough eligible choices for the no-repeat batch.');
    return c;
  }
  function applyConfig(value:unknown){
    const c=validateConfigValue(value);
    const removal=get<HTMLInputElement>(root,'[data-role="remove"]');
    if(removal)removal.checked=c.remove===true;
    const setText=(key:string,val:unknown)=>{
      if(val===undefined)return; // Older saved setups may omit newer optional fields.
      if(typeof val!=='string' || val.length>=12000)throw new Error('Invalid '+key+' value in saved setup.');
      const el=get<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>(root,'[data-role="'+key+'"]');
      if(el)el.value=val;
    };
    const restoreBatch=(val:unknown)=>{
      if(val===undefined)return;
      if(typeof val!=='string' || !val.trim() || !Number.isSafeInteger(Number(val)) || Number(val)<1 || Number(val)>100)
        throw new Error('Invalid batch size in saved setup.');
      setText('batch',val);
    };
    if(c.mode==='spin'||c.mode==='quick'){
      mode=c.mode;
      root.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button=>
        button.setAttribute('aria-pressed',String(button.dataset.mode===mode)));
    }
    if(typeof c.palette==='string')setPalette(c.palette);
    if(['fast','normal','slow'].includes(String(c.speed)))setText('speed',c.speed);
    if(isCustom)setText('entries',c.entries);
    else if(isLetters){
      if(['all','vowels','consonants','game'].includes(String(c.letterSet)))setText('letter-set',c.letterSet);
      if(['upper','lower'].includes(String(c.letterCase)))setText('letter-case',c.letterCase);
      setText('letter-exclude',c.letterExclude);
      restoreBatch(c.batch);
    }else if(isYesNo){
      if(['yesno','yesnomaybe'].includes(String(c.decisionMode)))setText('decision-mode',c.decisionMode);
    }else if(isWords){
      if(['nouns','verbs','adjectives','classroom','story','custom'].includes(String(c.wordCategory)))setText('word-category',c.wordCategory);
      setText('word-custom',c.wordCustom);
      restoreBatch(c.batch);
    }else{
      for(const key of ['min','max','step','excluded'])setText(key,c[key]);
      restoreBatch(c.batch);
    }
    if(!refresh())throw new Error('The saved or shared setup contains invalid choices or settings.');
    // Successful parsing of entries alone is insufficient: a restored
    // no-repeat batch must also fit its eligible candidate pool.
    validateCurrentSetup();
    updateModeLabels();
  }
  function validateCurrentSetup(){
    const candidate=readChoices();
    const eligible=candidate.filter(entry=>entry.weight>0).length;
    if(!eligible)throw new Error('At least one choice must have a positive weight before saving.');
    const batchText=(isNumbers||isLetters||isWords)
      ? asValue(get(root,'[data-role="batch"]')).trim():'1';
    if(!batchText)throw new Error('Enter how many results to draw (1–100).');
    const requested=Number(batchText);
    if(!Number.isSafeInteger(requested)||requested<1||requested>100)
      throw new Error('Choose 1–100 results per draw before saving.');
    if((get<HTMLInputElement>(root,'[data-role="remove"]')?.checked ?? false) && requested>eligible)
      throw new Error('Not enough eligible choices for the no-repeat batch.');
  }
  get<HTMLButtonElement>(root,'[data-action="save"]')?.addEventListener('click',()=>{
    try{
      if(!flushPendingEdit())return;
      validateCurrentSetup();
      localStorage.setItem(savedKey,JSON.stringify(config()));
      status('Setup saved in this browser.');
    }catch(error){
      status(error instanceof Error?error.message:'Could not save; browser storage may be unavailable.',true);
    }
  });
  get<HTMLButtonElement>(root,'[data-action="export-setup"]')?.addEventListener('click',()=>{
    try{
      if(!flushPendingEdit())return;
      validateCurrentSetup();
      const blob=new Blob([JSON.stringify(config(),null,2)],{type:'application/json;charset=utf-8'});
      const url=URL.createObjectURL(blob);
      const link=document.createElement('a');
      link.href=url;link.download='number-spinner-setup.json';
      document.body.append(link);link.click();link.remove();
      window.setTimeout(()=>URL.revokeObjectURL(url),5000);
      status('Setup JSON exported. The file contains your custom choices; keep it private.');
    }catch(error){status(error instanceof Error?error.message:'Could not export setup JSON.',true);}
  });
  const setupFile=get<HTMLInputElement>(root,'[data-role="setup-file"]');
  get<HTMLButtonElement>(root,'[data-action="import-setup"]')?.addEventListener('click',()=>{
    if(!locked)setupFile?.click();
  });
  setupFile?.addEventListener('change',async()=>{
    const file=setupFile.files?.[0];
    if(!file)return;
    const requestId=++setupImportRequestId;
    if(file.size>100000){
      status('Choose a setup JSON file under 100 KB.',true);
      setupFile.value='';
      return;
    }
    if(locked){setupFile.value='';return;}
    setBusy(true);
    try{
      const raw=await file.text();
      if(requestId!==setupImportRequestId || !locked)return;
      const parsed=JSON.parse(raw) as unknown;
      // applyConfig validates the entire object before changing any live control.
      applyConfig(parsed);
      setBusy(false);
      status('Setup imported. Save wheel if you want to keep it in this browser.');
    }catch(error){
      setBusy(false);
      status(error instanceof Error?'Setup JSON was not imported: '+error.message:'Could not import setup JSON.',true);
    }finally{
      setupFile.value='';
    }
  });
  get<HTMLButtonElement>(root,'[data-action="clear"]')?.addEventListener('click',()=>{
    try{
      // This action manages storage only. Start over is the explicit way to
      // cancel an ongoing spin or erase the current draw history.
      localStorage.removeItem(savedKey);
      status('Saved setup removed. Current picks and history are unchanged.');
    }catch(error){status(error instanceof Error?error.message:'Could not clear browser storage.',true);}
  });
  const shareDialog=get<HTMLDialogElement>(root,'[data-role="share-preview"]');
  const shareSummary=get<HTMLElement>(root,'[data-role="share-preview-summary"]');
  const shareSample=get<HTMLElement>(root,'[data-role="share-preview-sample"]');
  const shareWarning=get<HTMLElement>(root,'[data-role="share-preview-warning"]');
  const confirmShare=get<HTMLButtonElement>(root,'[data-action="confirm-share"]');
  let pendingShareUrl='';
  get<HTMLButtonElement>(root,'[data-action="share"]')?.addEventListener('click',()=>{
    try{
      if(!flushPendingEdit())return;
      validateCurrentSetup();
      const current=config();
      const encoded=encodeURIComponent(JSON.stringify(current));
      const canShare=encoded.length<=MAX_HASH_LENGTH;
      pendingShareUrl=canShare?location.origin+location.pathname+location.search+'#wheel='+encoded:'';
      const typeLabel=isCustom?'Custom wheel':isNumbers?'Number range':isLetters?'Letter wheel':isWords?'Word wheel':'Yes / No wheel';
      const batch=(isNumbers||isLetters||isWords)?' · batch '+String(current.batch):'';
      shareSummary!.textContent=typeLabel+' · '+String(current.mode||mode)+' mode'+batch+' · '+(current.remove?'remove winners':'keep winners');
      if(isCustom){
        const lines=String(current.entries).split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
        shareSample!.textContent=lines.length+' custom entries. Preview: '+lines.slice(0,6).join(' · ')+(lines.length>6?' · …':'');
      }else if(isNumbers){
        shareSample!.textContent='Range '+String(current.min)+'–'+String(current.max)+' · step '+String(current.step)+' · exclusions: '+(String(current.excluded||'none'));
      }else if(isLetters){
        shareSample!.textContent='Alphabet: '+String(current.letterSet)+' · '+String(current.letterCase)+' · exclusions: '+String(current.letterExclude||'none');
      }else if(isWords){
        shareSample!.textContent='Word collection: '+String(current.wordCategory)+(current.wordCategory==='custom'?' · '+String(current.wordCustom).split(/\r?\n/).length+' custom lines':'');
      }else{
        shareSample!.textContent='Decision options: '+String(current.decisionMode);
      }
      confirmShare!.disabled=!canShare;
      shareWarning!.textContent=canShare
        ? 'This link stores the setup in its URL fragment. Anyone with the link can read custom choices. Do not share private names or student lists.'
        : 'This setup is too large for a reliable share link. Use Export setup JSON instead; the file stays on your device.';
      if(shareDialog && typeof shareDialog.showModal==='function')shareDialog.showModal();
      else status('Share preview is unavailable in this browser.',true);
    }catch(error){status(error instanceof Error?error.message:'Could not prepare share preview.',true);}
  });
  get<HTMLButtonElement>(root,'[data-action="cancel-share"]')?.addEventListener('click',()=>{
    pendingShareUrl='';
    if(shareDialog?.open)shareDialog.close();
  });
  confirmShare?.addEventListener('click',async()=>{
    const url=pendingShareUrl;
    if(!url){status('This setup is too large for a share link. Export setup JSON instead.',true);return;}
    try{
      await navigator.clipboard.writeText(url);
      pendingShareUrl='';
      shareDialog?.close();
      status('Link copied. Anyone with this link can read the included choices; do not share private names.');
    }catch{
      status('Clipboard unavailable. You can copy the link from the browser address bar after sharing is prepared.',true);
    }
  });
  updateModeLabels();
  const defaultSetup=config();
  try{
    if(location.hash.startsWith('#wheel=')){
      applyConfig(JSON.parse(decodeURIComponent(location.hash.slice(7))));
    }else{
      // Explicit 1–N shortcut takes precedence over a saved generic range.
      // A shared #wheel config still takes precedence over query parameters.
      const queryRange=isNumbers && location.pathname==='/random-number-wheel/'
        ? parseNumericRangeQuery(location.search) : null;
      if(queryRange){
        const minInput=get<HTMLInputElement>(root,'[data-role="min"]');
        const maxInput=get<HTMLInputElement>(root,'[data-role="max"]');
        if(minInput)minInput.value=String(queryRange.min);
        if(maxInput)maxInput.value=String(queryRange.max);
        refresh();
        status('Range '+queryRange.min+'–'+queryRange.max+' loaded from your link. Use Quick Pick or Spin Wheel.');
      }else{
        let saved:string|null=null;
        try{saved=localStorage.getItem(savedKey);}catch{}
        if(saved){
          applyConfig(JSON.parse(saved));
          status('Your saved wheel is ready.');
        }else refresh();
      }
    }
  }catch(error){
    // A failed restore may already have mutated several fields. Restore the
    // original server-rendered defaults, not the broken saved values.
    try{applyConfig(defaultSetup);}catch{refresh();}
    status('Saved or shared setup was invalid; original defaults restored. '+(error instanceof Error?error.message:''),true);
  }
}
document.querySelectorAll<HTMLElement>('[data-wheel-app]').forEach(init);
