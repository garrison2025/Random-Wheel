
import {numberChoices, parseExclusions, parseEntries, pickEntry, secureIndex, type Entry} from '../lib/random';

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
const asValue = (el: Element | null) => el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement ? el.value : '';
function csvRows(content: string): string[][] {
  const rows: string[][]=[];let cells:string[]=[];let current='';let quoted=false;
  for (let i=0;i<content.length;i++){
    const ch=content[i]!;
    if(ch==='"'){
      if(quoted && content[i+1]==='"'){current+='"';i++;}
      else quoted=!quoted;
    } else if(ch===',' && !quoted){cells.push(current);current='';}
    else if((ch==='\n'||ch==='\r')&&!quoted){
      if(ch==='\r'&&content[i+1]==='\n') i++;
      cells.push(current);if(cells.some(c=>c.trim()))rows.push(cells);
      cells=[];current='';
    } else current+=ch;
  }
  if(quoted) throw new Error('The CSV file has an unclosed quoted field.');
  cells.push(current);if(cells.some(c=>c.trim()))rows.push(cells);
  return rows;
}
function init(root: HTMLElement) {
  const disc=get<HTMLElement>(root,'[data-role="wheel-disc"]')!;
  const wrap=get<HTMLElement>(root,'[data-role="wheel-wrap"]')!;
  const result=get<HTMLElement>(root,'[data-role="result"]')!;
  const resultCard=get<HTMLElement>(root,'.result-card');
  const feedback=get<HTMLElement>(root,'[data-role="feedback"]')!;
  const history=get<HTMLElement>(root,'[data-role="history"]')!;
  const counter=get<HTMLElement>(root,'[data-role="candidate-count"]')!;
  const overlay=get<HTMLElement>(root,'[data-role="wheel-overlay"]')!;
  const pickButton=get<HTMLButtonElement>(root,'[data-action="pick"]')!;
  const resetButton=get<HTMLButtonElement>(root,'[data-action="reset"]')!;
  const centerButton=get<HTMLButtonElement>(root,'[data-action="center"]');
  const centerLabel=get<HTMLElement>(root,'[data-role="center-label"]');
  if(!disc || !wrap || !result || !feedback || !history || !counter || !overlay || !pickButton || !resetButton) return;
  const isCustom = root.dataset.kind === 'custom';
  let mode:'quick'|'spin'=isCustom?'spin':'quick';
  let locked=false, rotation=0;
  let pickedIndices = new Set<number>();
  let winningHistory:string[]=[];
  let entries:Entry[]=[];
  const savedKey='wheelcanvas.v1.'+(isCustom?'custom':'numbers');
  function setPalette(name:string){
    if(!(name in PALETTES))return;
    paletteName=name;
    COLORS=PALETTES[name]!;
    root.querySelectorAll<HTMLButtonElement>('[data-palette]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.palette===name)));
    render();
  }

  const status=(message:string,error=false)=>{ feedback.textContent=message;feedback.classList.toggle('error',error); };
  const setBusy=(busy:boolean)=>{
    locked=busy;pickButton.disabled=busy;resetButton.disabled=busy;
    if(centerButton) centerButton.disabled=busy;
    root.querySelectorAll<HTMLInputElement|HTMLTextAreaElement>('.sidebar input,.sidebar textarea').forEach(el=>{el.disabled=busy;});
    root.querySelectorAll<HTMLButtonElement>('[data-template]').forEach(el=>{el.disabled=busy;});
  };
  const updateModeLabels=()=>{
    pickButton.textContent=mode==='quick'?'⚡ Pick instantly':'✳ Spin the wheel';
    if(centerLabel) centerLabel.textContent=mode==='quick'?'PICK':'SPIN';
    if(centerButton)centerButton.setAttribute('aria-label',mode==='quick'?'Pick a random result':'Spin the wheel');
  };
  const readChoices=():Entry[]=>{
    if(isCustom) return parseEntries(asValue(get(root,'[data-role="entries"]')));
    const min=Number(asValue(get(root,'[data-role="min"]')));
    const max=Number(asValue(get(root,'[data-role="max"]')));
    const step=Number(asValue(get(root,'[data-role="step"]')));
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
    pickedIndices=new Set();winningHistory=[];
    result.textContent='Ready when you are';
    resultCard?.classList.remove('is-picked');
    renderHistory();status(message);
    disc.style.transition='none';disc.style.transform='rotate(0deg)';rotation=0;
    render();void disc.offsetWidth;disc.style.transition='transform 3.6s cubic-bezier(.15,.85,.15,1)';
  };
  function activeChoices(){
    const remove=get<HTMLInputElement>(root,'[data-role="remove"]')?.checked ?? false;
    return entries.map((entry,index)=>({entry,index})).filter(v=>v.entry.weight>0 && (!remove || !pickedIndices.has(v.index)));
  }
  function render(){
    const active=activeChoices();
    const total=active.reduce((s,a)=>s+a.entry.weight,0);
    counter.textContent=active.length + (active.length===1?' active choice':' active choices');
    disc.textContent='';
    const abstract=active.length>36;
    wrap.classList.toggle('is-abstract',abstract);
    if (!active.length) {disc.style.background='#dce1f1';overlay.textContent='No available choices';return;}
    if(abstract){
      const bands=12;
      disc.style.background='conic-gradient('+Array.from({length:bands},(_,i)=>COLORS[i%COLORS.length]+' '+(i*100/bands)+'% '+((i+1)*100/bands)+'%').join(',')+')';
      overlay.textContent=active.length+' possibilities';
      return;
    }
    let degree=0;
    const stops:string[]=[];
    for(let i=0;i<active.length;i++){
      const size=active[i]!.entry.weight/total*360;
      const start=degree;degree+=size;
      stops.push(COLORS[i%COLORS.length]+' '+start.toFixed(6)+'deg '+degree.toFixed(6)+'deg');
      if(active.length<=12){
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
        label.style.left=(50+Math.sin(at)*32)+'%';
        label.style.top=(50-Math.cos(at)*32)+'%';
        disc.append(label);
      }
    }
    disc.style.background='conic-gradient('+stops.join(',')+')';
  }
  function refresh(){
    try {
      entries=readChoices();
      if(!entries.some(e=>e.weight>0)) throw new Error('At least one choice must have a positive weight.');
      reset('Ready to draw.');
    } catch(error) {
      entries=[];pickedIndices.clear();winningHistory=[];renderHistory();
      result.textContent='Check your settings';
      resultCard?.classList.remove('is-picked');
      status(error instanceof Error?error.message:'Invalid choices.',true);
      render();
    }
  }
  function showWinner(label:string,index:number){
    winningHistory.unshift(label);if(winningHistory.length>60)winningHistory.pop();
    result.textContent=label;
    resultCard?.classList.remove('is-picked');
    // Restart a subtle reveal animation for successive draws.
    void resultCard?.offsetWidth;
    resultCard?.classList.add('is-picked');
    const removeWinner=get<HTMLInputElement>(root,'[data-role="remove"]')?.checked ?? false;
    if(removeWinner) pickedIndices.add(index);
    renderHistory();status('Draw completed with browser-based secure randomness.');
    // Hold the selected segment at the pointer until the next spin, then paint the remaining entries.
    if(mode==='quick' || !removeWinner) render();
    else counter.textContent=activeChoices().length+' choices remaining';
    setBusy(false);
  }
  function pick(){
    if(locked) return;
    try{
      entries=readChoices();
      const active=activeChoices();
      if(!active.length) throw new Error('No choices remain. Reset the round or change your settings.');
      if(mode==='spin' && pickedIndices.size && get<HTMLInputElement>(root,'[data-role="remove"]')?.checked){
        disc.style.transition='none';disc.style.transform='rotate(0deg)';rotation=0;
        render();void disc.offsetWidth;disc.style.transition='transform 3.6s cubic-bezier(.15,.85,.15,1)';
      }
      const selected=pickEntry(active.map(a=>a.entry));
      const chosen=active[selected]!;
      setBusy(true);
      status(mode==='spin'?'Spinning…':'Picking…');
      if(mode==='quick' || matchMedia('(prefers-reduced-motion: reduce)').matches){
        showWinner(chosen.entry.label,chosen.index);
        return;
      }
      const abstract=active.length>36;
      let landing:number;
      if (abstract) landing=secureIndex(360);
      else {
        const total=active.reduce((n,e)=>n+e.entry.weight,0);
        const start=active.slice(0,selected).reduce((n,e)=>n+e.entry.weight,0)/total*360;
        const width=chosen.entry.weight/total*360;
        landing=(360-(start+width/2)%360)%360;
      }
      const current=((rotation%360)+360)%360;
      const delta=(landing-current+360)%360;
      rotation += (5+secureIndex(3))*360+delta;
      disc.style.transform='rotate('+rotation+'deg)';
      window.setTimeout(()=>showWinner(chosen.entry.label,chosen.index),3650);
    } catch(error){
      setBusy(false);
      status(error instanceof Error?error.message:'Random selection failed.',true);
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
  root.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button=>button.addEventListener('click',()=>{
    if(locked)return;
    mode=button.dataset.mode==='spin'?'spin':'quick';
    root.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    updateModeLabels();
    status(mode==='quick'?'Instant result mode selected.':'Animated wheel mode selected.');
  }));
  pickButton.addEventListener('click',pick);
  centerButton?.addEventListener('click',pick);
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
  let editTimer:number|undefined;
  root.querySelectorAll<HTMLInputElement|HTMLTextAreaElement>('[data-role="min"],[data-role="max"],[data-role="step"],[data-role="excluded"],[data-role="entries"]')
    .forEach(el=>{
      el.addEventListener('input',()=>{
        if(locked)return;
        window.clearTimeout(editTimer);
        editTimer=window.setTimeout(refresh,180);
      });
      el.addEventListener('change',()=>{
        window.clearTimeout(editTimer);
        if(!locked)refresh();
      });
    });
  get<HTMLInputElement>(root,'[data-role="remove"]')?.addEventListener('change',()=>{if(!locked)reset('Removal setting changed; started a fresh round.');});
  get<HTMLInputElement>(root,'[data-role="file"]')?.addEventListener('change',async event=>{
    if(locked)return;
    const file=(event.currentTarget as HTMLInputElement).files?.[0];
    if(!file)return;
    if(file.size>50000){status('Choose a file under 50 KB.',true);return;}
    try {
      const text=await file.text();
      const rows=file.name.toLowerCase().endsWith('.csv')?csvRows(text):text.split(/\r?\n/).map(line=>[line]);
      if(rows.length>100)throw new Error('Import at most 100 entries.');
      const lines=rows.filter(r=>r[0]?.trim()).map(r=>{
        const name=r[0]!.trim();
        return r[1]?.trim() ? name+' | '+r[1].trim() : name;
      });
      const target=get<HTMLTextAreaElement>(root,'[data-role="entries"]');
      if(target){target.value=lines.join('\n');refresh();}
    } catch(error){status(error instanceof Error?error.message:'Could not read the file.',true);}
  });
  get<HTMLButtonElement>(root,'[data-action="copy"]')?.addEventListener('click',async()=>{
    if(!winningHistory.length){status('Draw a result first.');return;}
    try{await navigator.clipboard.writeText(winningHistory.join('\n'));status('Results copied.');}
    catch{status('Copy is unavailable. Select the history and copy manually.',true);}
  });
  function config(){
    return isCustom ? {type:'custom',palette:paletteName,entries:asValue(get(root,'[data-role="entries"]'))}
      :{type:'numbers',palette:paletteName,min:asValue(get(root,'[data-role="min"]')),max:asValue(get(root,'[data-role="max"]')),
         step:asValue(get(root,'[data-role="step"]')),excluded:asValue(get(root,'[data-role="excluded"]'))};
  }
  function applyConfig(value:unknown){
    if(!value || typeof value!=='object')throw new Error('Invalid saved setup.');
    const c=value as Record<string,unknown>;
    if(c.type!==(isCustom?'custom':'numbers'))throw new Error('The setup is for a different tool.');
    const setText=(key:string,val:unknown)=>{const el=get<HTMLInputElement|HTMLTextAreaElement>(root,'[data-role="'+key+'"]');if(el&&typeof val==='string'&&val.length<12000)el.value=val;};
    if(typeof c.palette==='string')setPalette(c.palette);
    if(isCustom)setText('entries',c.entries);
    else {for(const key of ['min','max','step','excluded'])setText(key,c[key]);}
    refresh();
  }
  get<HTMLButtonElement>(root,'[data-action="save"]')?.addEventListener('click',()=>{
    try{localStorage.setItem(savedKey,JSON.stringify(config()));status('Setup saved in this browser.');}
    catch{status('Could not save; private browsing may disable local storage.',true);}
  });
  get<HTMLButtonElement>(root,'[data-action="clear"]')?.addEventListener('click',()=>{
    localStorage.removeItem(savedKey);
    if(location.hash.startsWith('#wheel=')) window.history.replaceState(null,'',location.pathname+location.search);
    status('Saved setup removed from this browser.');reset();
  });
  get<HTMLButtonElement>(root,'[data-action="share"]')?.addEventListener('click',async()=>{
    try{
      const encoded=encodeURIComponent(JSON.stringify(config()));
      if(encoded.length>MAX_HASH_LENGTH)throw new Error('Setup too long for a share link; use a shorter list. Your data stays local.');
      const url=location.origin+location.pathname+location.search+'#wheel='+encoded;
      await navigator.clipboard.writeText(url);
      status('Link copied. Anyone with this link can read the included choices; do not share private names.');
    } catch(error){status(error instanceof Error?error.message:'Could not copy setup link.',true);}
  });
  updateModeLabels();
  try{
    if(location.hash.startsWith('#wheel=')){
      applyConfig(JSON.parse(decodeURIComponent(location.hash.slice(7))));
    }else{
      let saved:string|null=null;
      try{saved=localStorage.getItem(savedKey);}catch{}
      if(saved){
        applyConfig(JSON.parse(saved));
        status('Your saved wheel is ready.');
      }else refresh();
    }
  }catch{
    refresh();
    status('Saved or shared setup could not be loaded; showing the default wheel.',true);
  }
}
document.querySelectorAll<HTMLElement>('[data-wheel-app]').forEach(init);
