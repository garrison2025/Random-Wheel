export type DecisionMode='yesno'|'yesnomaybe';
export interface RoundScore {complete:boolean;winner:'Yes'|'No'|'Maybe'|null;tied:boolean;draws:number}
export function scoreDecisionRound(counts:Readonly<Record<string,number>>,mode:DecisionMode,bestOfThree:boolean):RoundScore{
  const labels=mode==='yesnomaybe'?['Yes','No','Maybe']:['Yes','No'];
  const nums=labels.map(k=>counts[k]??0);
  if(nums.some(n=>!Number.isSafeInteger(n)||n<0))throw new RangeError('Invalid round tally.');
  const draws=nums.reduce((a,b)=>a+b,0);
  if(!bestOfThree)return {complete:false,winner:null,tied:false,draws};
  const max=Math.max(...nums);
  const complete=mode==='yesno'?(max>=2||draws>=3):draws>=3;
  if(!complete)return {complete:false,winner:null,tied:false,draws};
  const top=labels.filter((_,i)=>nums[i]===max);
  return {complete:true,winner:top.length===1?top[0] as RoundScore['winner']:null,tied:top.length!==1,draws};
}
