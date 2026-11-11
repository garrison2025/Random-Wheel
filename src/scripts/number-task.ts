import {secureIndex} from '../lib/random';
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
  const nextButton=find<HTMLButtonElement>('next');
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
  function clear(){
    drawn=[];progress=0;
    exportButton.disabled=true;
    if(nextButton)nextButton.disabled=true;
    results.replaceChildren();
    summary.hidden=true;
    summary.textContent='';
  }
  function showRows(rows:TaskResult[]){
    results.replaceChildren();
    const fragment=document.createDocumentFragment();
    for(const row of rows){
      const item=document.createElement('div');
      item.className='task-result-row';
      const pos=document.createElement('span');
      pos.className='task-position';
      pos.textContent=String(row.position).padStart(2,'0');
      const label=document.createElement('span');
      label.className='task-result-label';
      label.textContent=row.label;
      const number=document.createElement('strong');
      number.className='task-result-number';
      number.textContent=String(row.number);
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
        setSummary(teams.length+' teams assigned to unique stations');
        tell('Each station is allocated at most once. Export the pairing as CSV.');
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
        tell('Tap “Call next student” to advance without repeats.');
        nextButton!.disabled=false;
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
  });
  exportButton.addEventListener('click',()=>{
    if(!drawn.length)return;
    const cells=(values:string[])=>values.map(escapeCsvCell).join(',');
    const header=cells(['Position','Participant or choice','Selected number']);
    const rows=drawn.map(row=>cells([String(row.position),row.label,String(row.number)]));
    const csv='\uFEFF'+[header,...rows].join('\r\n')+'\r\n';
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download='wheelcanvas-'+task+'-results.csv';
    document.body.append(a);a.click();a.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),5000);
    tell('CSV downloaded: '+drawn.length+' results.');
  });
  section.querySelectorAll<HTMLInputElement|HTMLTextAreaElement>('.task-fields input,.task-fields textarea').forEach(input=>{
    input.addEventListener('input',()=>{
      if(drawn.length){clear();tell('Settings changed. Generate a new result.');}
    });
    input.addEventListener('change',()=>{
      if(drawn.length){clear();tell('Settings changed. Generate a new result.');}
    });
  });
}
document.querySelectorAll<HTMLElement>('[data-number-task]').forEach(init);
