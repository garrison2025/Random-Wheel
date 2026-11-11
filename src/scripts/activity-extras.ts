import {scoreDecisionRound} from '../lib/decision-round';
type WinnerEvent=CustomEvent<{label:string;labels?:string[]}>;
function initLetter(root:HTMLElement){
  const topic=root.querySelector<HTMLSelectElement>('[data-role="letter-game-topic"]');
  const message=root.querySelector<HTMLElement>('[data-role="letter-challenge"]');
  const button=root.querySelector<HTMLButtonElement>('[data-action="game-timer"]');
  const clock=root.querySelector<HTMLElement>('[data-role="game-clock"]');
  if(!topic||!message||!button||!clock)return;
  const nouns:Record<string,string>={animal:'animal',place:'city or country',food:'food',name:"person's name"};
  let chosen:string|null=null;
  let interval:number|undefined;
  let seconds=60;
  const refreshClock=()=>{
    clock.textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
  };
  const cancelTimer=()=>{
    if(interval!==undefined)window.clearInterval(interval);
    interval=undefined;seconds=60;refreshClock();button.textContent='Start 60-second challenge';
  };
  const prompt=()=>{
    message.textContent=chosen
      ? 'Name a '+(nouns[topic.value]||'word')+' beginning with '+chosen.toUpperCase()+'.'
      : 'Spin one letter to begin a classroom challenge.';
  };
  root.addEventListener('wheelcanvas:result',event=>{
    chosen=(event as WinnerEvent).detail.label?.slice(0,1)||null;
    cancelTimer();prompt();
  });
  root.addEventListener('wheelcanvas:reset',()=>{chosen=null;cancelTimer();prompt();});
  topic.addEventListener('change',prompt);
  button.addEventListener('click',()=>{
    if(interval!==undefined){cancelTimer();return;}
    if(!chosen){message.textContent='Spin a letter before starting the timed challenge.';return;}
    seconds=60;refreshClock();
    button.textContent='Stop timer';
    interval=window.setInterval(()=>{
      seconds=Math.max(0,seconds-1);refreshClock();
      if(seconds===0){
        cancelTimer();clock.textContent='00:00';
        message.textContent+=' Time is up!';
      }
    },1000);
  });
}
function initYesNo(root:HTMLElement){
  const question=root.querySelector<HTMLInputElement>('[data-role="question"]');
  const display=root.querySelector<HTMLElement>('[data-role="question-display"]');
  const best=root.querySelector<HTMLInputElement>('[data-role="best-of-three"]');
  const round=root.querySelector<HTMLElement>('[data-role="round-status"]');
  const remove=root.querySelector<HTMLInputElement>('[data-role="remove"]');
  const picker=root.querySelector<HTMLButtonElement>('[data-action="pick"]');
  const center=root.querySelector<HTMLButtonElement>('[data-action="center"]');
  const reset=root.querySelector<HTMLButtonElement>('[data-action="reset"]');
  if(!question||!display||!best||!round||!picker||!reset)return;
  const counts:Record<string,number>={Yes:0,No:0,Maybe:0};
  let total=0;
  const paint=()=>{
    for(const answer of ['Yes','No','Maybe']){
      const span=root.querySelector<HTMLElement>('[data-tally="'+answer+'"]');
      if(span)span.textContent=String(counts[answer]||0);
    }
    const optionMode=root.querySelector<HTMLSelectElement>('[data-role="decision-mode"]')?.value==='yesnomaybe'?'yesnomaybe':'yesno';
    const decision=scoreDecisionRound(counts,optionMode,best.checked);
    if(decision.complete){
      round.textContent=optionMode==='yesno'
        ? 'Best of 3 complete: '+decision.winner+' wins with two matching answers. Reset to play again.'
        : decision.tied
          ? 'Three draws complete: a three-way tie. Reset to play again.'
          : 'Three draws complete: '+decision.winner+' received the most votes. Reset to play again.';
      picker.disabled=true;
      if(center)center.disabled=true;
    }else{
      round.textContent=best.checked
        ? optionMode==='yesno'
          ? total+' draw'+(total===1?'':'s')+'. First answer to win two draws wins the best of three.'
          : total+' of 3 draws. The most frequent answer wins; a tie is possible.'
        : total+' draws this round. The next pick is independent.';
    }
  };
  const clear=()=>{
    counts.Yes=0;counts.No=0;counts.Maybe=0;total=0;
    picker.disabled=false;if(center)center.disabled=false;
    paint();
  };
  const showQuestion=()=>{
    const typed=question.value.trim();
    display.hidden=!typed;
    display.textContent=typed?'Question: '+typed:'';
  };
  question.addEventListener('input',showQuestion);
  root.addEventListener('wheelcanvas:result',event=>{
    const label=(event as WinnerEvent).detail.label;
    if(label in counts){counts[label]!+=1;total+=1;paint();}
  });
  root.addEventListener('wheelcanvas:reset',clear);
  best.addEventListener('change',()=>{
    if(best.checked && remove?.checked){
      remove.checked=false;
      remove.dispatchEvent(new Event('change',{bubbles:true}));
    }
    reset.click();
    clear();
  });
  remove?.addEventListener('change',()=>{
    if(best.checked && remove.checked){
      best.checked=false;
      clear();
    }
  });
  showQuestion();
  paint();
}
document.querySelectorAll<HTMLElement>('[data-wheel-app]').forEach(root=>{
  if(root.dataset.kind==='letters')initLetter(root);
  if(root.dataset.kind==='yesno')initYesNo(root);
});
