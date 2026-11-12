import {secureIndex,parseExclusions} from '../lib/random';
import {escapeCsvCell} from '../lib/export';
import {assignStations,namedRollCall,parseParticipantNames,sampleNumbers,shuffledCallOrder,type TaskResult} from '../lib/seo-workflows';

function init(section:HTMLElement){
  const task=section.dataset.numberTask;
  const max=Number(section.dataset.range);
  const find=<T extends Element>(name:string)=>section.querySelector<T>('[data-task="'+name+'"]');
  const status=find<HTMLElement>('status')!;
  const summary=find<HTMLElement>('summary')!;
  const results=find<HTMLElement>('results')!;
  const exportButton=find<HTMLButtonElement>('export')!;
  const exportCalledButton=find<HTMLButtonElement>('export-called');
  const nextButton=find<HTMLButtonElement>('next');
  const undoButton=find<HTMLButtonElement>('undo');
  const copyButton=find<HTMLButtonElement>('copy');
  const stationHead=find<HTMLElement>('station-head');
  const progressWrap=find<HTMLElement>('progress-wrap');
  const progressBar=find<HTMLProgressElement>('progress');
  const progressText=find<HTMLElement>('progress-text');
  let drawn:TaskResult[]=[];
  let progress=0;

  const value=(name:string):string=>{
    const field=find<HTMLInputElement|HTMLTextAreaElement>(name);
    return field?.value||'';
  };
  function tell(message:string,error=false){
    status.textContent=message;
    status.classList.toggle('is-error',error);
  }
  function updateProgress(){
    if(!progressWrap || !progressBar || !progressText)return;
    progressWrap.hidden=!drawn.length;
    progressBar.max=drawn.length || 30;
    progressBar.value=progress;
    progressText.textContent=progress+' of '+drawn.length+' called · '+(drawn.length-progress)+' remaining';
    if(undoButton)undoButton.disabled=progress<=0;
    if(exportCalledButton)exportCalledButton.disabled=progress<=0;
  }
  function clear(){
    drawn=[];progress=0;
    exportButton.disabled=true;
    if(exportCalledButton)exportCalledButton.disabled=true;
    if(nextButton)nextButton.disabled=true;
    if(undoButton)undoButton.disabled=true;
    if(copyButton)copyButton.disabled=true;
    if(stationHead)stationHead.hidden=true;
    results.replaceChildren();
    summary.hidden=true;
    summary.textContent='';
    updateProgress();
  }
  function getAbsentNumbers():number[]{
    const list=parseExclusions(value('absent'));
    if(list.some(n=>n<1||n>30))throw new Error('Absent roll numbers must be between 1 and 30.');
    return [...new Set(list)].sort((a,b)=>a-b);
  }
  function updateAbsenceButtons(){
    if(task!=='attendance')return;
    try{
      const absent=new Set(getAbsentNumbers());
      section.querySelectorAll<HTMLButtonElement>('[data-absent-number]').forEach(btn=>{
        const n=Number(btn.dataset.absentNumber);
        const isAbsent=absent.has(n);
        btn.setAttribute('aria-pressed',String(isAbsent));
        btn.setAttribute('aria-label',(isAbsent?'Mark roll number ':'Mark roll number ')+n+(isAbsent?' present':' absent'));
        btn.classList.toggle('is-absent',isAbsent);
      });
      const count=find<HTMLElement>('absent-count');
      if(count)count.textContent=absent.size+' absent · '+(30-absent.size)+' present';
    }catch(error){
      tell(error instanceof Error?error.message:'Invalid absent number.',true);
    }
  }
  function showRows(rows:TaskResult[]){
    results.replaceChildren();
    const fragment=document.createDocumentFragment();
    const ordered=task==='stations'?[...rows].sort((a,b)=>a.number-b.number):rows;
    for(const row of ordered){
      const item=document.createElement('div');
      item.className='task-result-row'+(task==='stations'?' is-station':'');
      if(task==='stations')item.dataset.station=String(row.number);
      const pos=document.createElement('span');
      pos.className='task-position';
      pos.textContent=task==='stations'?'S'+String(row.number).padStart(2,'0'):String(row.position).padStart(2,'0');
      const label=document.createElement('span');
      label.className='task-result-label';
      label.textContent=row.label;
      const number=document.createElement('strong');
      number.className='task-result-number';
      number.textContent=String(row.number);
      if(task==='stations')number.hidden=true;
      item.append(pos,label,number);
      fragment.append(item);
    }
    results.append(fragment);
  }
  function setSummary(message:string){
    summary.hidden=false;
    summary.textContent=message;
  }
  function generate(fullOrder=false){
    clear();
    try{
      if(task==='two'){
        const first=value('choice-a').trim(),second=value('choice-b').trim();
        if(!first || !second)throw new Error('Give both numbered options a short label.');
        if(first.length>70||second.length>70)throw new Error('Use labels of 70 characters or less.');
        if(first.toLocaleLowerCase('en-US')===second.toLocaleLowerCase('en-US'))throw new Error('Use two different option labels.');
        const number=secureIndex(2)+1;
        drawn=[{position:1,label:number===1?first:second,number}];
        setSummary('Result: '+number+' — '+drawn[0]!.label);
        tell('One independent draw with a 50% chance for each option.');
      }else if(task==='stations'){
        const teams=parseParticipantNames(value('participants'),8);
        drawn=assignStations(teams);
        setSummary(teams.length+' teams assigned · '+(8-teams.length)+' unassigned stations');
        tell('Each station is allocated at most once. Copy or export the station-sorted pairing list.');
        if(copyButton)copyButton.disabled=false;
        if(stationHead)stationHead.hidden=false;
      }else if(task==='ten'){
        drawn=sampleNumbers(10,fullOrder?10:1,'',fullOrder);
        setSummary(fullOrder?'Your randomized order from 1 to 10': 'Picked '+drawn[0]!.number+' from 1–10');
        tell(fullOrder?'Every number appears exactly once.':'One instant, independent draw.');
      }else if(task==='roster'){
        const names=parseParticipantNames(value('participants'),15);
        drawn=namedRollCall(names);
        setSummary('Fair call order for '+names.length+' participants');
        tell('Every participant appears exactly once; copy or export this order.');
      }else if(task==='attendance'){
        drawn=shuffledCallOrder(30,value('absent'));
        setSummary('Ready: '+drawn.length+' present students');
        tell('Ready to call '+drawn.length+' present students; each appears only once.');
        nextButton!.disabled=false;
        updateProgress();
      }else if(task==='batch'){
        const count=Number(value('count'));
        const unique=find<HTMLInputElement>('unique')?.checked??true;
        drawn=sampleNumbers(max,count,value('absent'),unique);
        const nums=drawn.map(v=>v.number);
        const distinct=new Set(nums).size;
        setSummary(drawn.length+' results · '+distinct+' unique · min '+Math.min(...nums)+' · max '+Math.max(...nums));
        tell(unique?'All results are distinct.':'Results are independent; repeats are permitted.');
      }else throw new Error('Unsupported task.');
      exportButton.disabled=false;
      if(task!=='attendance')showRows(drawn);
    }catch(error){
      clear();
      tell(error instanceof Error?error.message:'Could not complete the draw.',true);
    }
  }
  find<HTMLButtonElement>('generate')?.addEventListener('click',()=>generate());
  find<HTMLButtonElement>('full-order')?.addEventListener('click',()=>generate(true));
  nextButton?.addEventListener('click',()=>{
    if(!drawn.length||progress>=drawn.length)return;
    const next=drawn[progress]!;
    progress+=1;
    showRows(drawn.slice(0,progress));
    setSummary('Now calling: '+next.label+' ('+progress+' of '+drawn.length+')');
    tell(progress===drawn.length?'All present students have been called.':'Students remaining: '+(drawn.length-progress));
    nextButton.disabled=progress>=drawn.length;
    updateProgress();
  });
  undoButton?.addEventListener('click',()=>{
    if(task!=='attendance'||!drawn.length||progress<=0)return;
    progress-=1;
    showRows(drawn.slice(0,progress));
    if(progress>0){
      setSummary('Now calling: '+drawn[progress-1]!.label+' ('+progress+' of '+drawn.length+')');
    }else{
      setSummary('Ready: '+drawn.length+' present students');
    }
    tell('Last call undone. '+(drawn.length-progress)+' students remain.');
    if(nextButton)nextButton.disabled=false;
    updateProgress();
  });
  copyButton?.addEventListener('click',async()=>{
    if(task!=='stations'||!drawn.length)return;
    const ordered=[...drawn].sort((a,b)=>a.number-b.number);
    const text=ordered.map(row=>'Station '+row.number+': '+row.label).join('\n');
    try{
      if(!navigator.clipboard?.writeText)throw new Error('Clipboard access is unavailable');
      await navigator.clipboard.writeText(text);
      tell('Copied all '+ordered.length+' station assignments.');
    }catch{
      tell('Clipboard permission unavailable. Use Download CSV instead.',true);
    }
  });
  function exportRows(calledOnly=false){
    if(!drawn.length || (calledOnly && (!progress || task!=='attendance')))return;
    const cells=(values:string[])=>values.map(escapeCsvCell).join(',');
    const ordered=calledOnly ? drawn.slice(0,progress) : task==='stations'?[...drawn].sort((a,b)=>a.number-b.number):drawn;
    const header=task==='stations'?cells(['Station','Team']):cells(['Position','Participant or choice','Selected number']);
    const rows=task==='stations'
      ? ordered.map(row=>cells([String(row.number),row.label]))
      : ordered.map(row=>cells([String(row.position),row.label,String(row.number)]));
    const csv='\uFEFF'+[header,...rows].join('\r\n')+'\r\n';
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download='number-spinner-'+task+(calledOnly?'-called':'')+'-results.csv';
    document.body.append(a);a.click();a.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),5000);
    tell('CSV downloaded: '+ordered.length+' '+(calledOnly?'already-called':'total')+' results.');
  }
  exportButton.addEventListener('click',()=>exportRows());
  exportCalledButton?.addEventListener('click',()=>exportRows(true));
  if(task==='attendance'){
    document.addEventListener('keydown',event=>{
      if(event.defaultPrevented || event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.isComposing)return;
      const target=event.target as HTMLElement|null;
      if(target?.closest('input,textarea,select,[contenteditable="true"]'))return;
      const key=event.key.toLowerCase();
      const button=key==='n'?nextButton:key==='u'?undoButton:null;
      if(!button || button.disabled || !drawn.length)return;
      event.preventDefault();
      button.click();
    });
  }
  section.querySelectorAll<HTMLInputElement|HTMLTextAreaElement>('.task-fields input,.task-fields textarea').forEach(input=>{
    input.addEventListener('input',()=>{
      if(drawn.length){clear();tell('Settings changed. Generate a new result.');}
      if(input.dataset.task==='absent')updateAbsenceButtons();
    });
    input.addEventListener('change',()=>{
      if(drawn.length){clear();tell('Settings changed. Generate a new result.');}
      if(input.dataset.task==='absent')updateAbsenceButtons();
    });
  });
  section.querySelectorAll<HTMLButtonElement>('[data-absent-number]').forEach(button=>{
    button.addEventListener('click',()=>{
      try{
        const absent=new Set(getAbsentNumbers());
        const number=Number(button.dataset.absentNumber);
        if(absent.has(number))absent.delete(number);else absent.add(number);
        const input=find<HTMLInputElement>('absent');
        if(input)input.value=[...absent].sort((a,b)=>a-b).join(', ');
        if(drawn.length){clear();tell('Attendance changed. Generate a fresh roll-call order.');}
        updateAbsenceButtons();
      }catch(error){tell(error instanceof Error?error.message:'Invalid roll numbers.',true);}
    });
  });
  find<HTMLButtonElement>('clear-absent')?.addEventListener('click',()=>{
    const input=find<HTMLInputElement>('absent');
    if(input)input.value='';
    if(drawn.length)clear();
    updateAbsenceButtons();
    tell('Everyone is marked present. Generate a new order.');
  });
  updateAbsenceButtons();
}
document.querySelectorAll<HTMLElement>('[data-number-task]').forEach(init);
