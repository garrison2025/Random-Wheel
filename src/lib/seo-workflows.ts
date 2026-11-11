import {cryptoSource,numberChoices,parseExclusions,drawIndices,shuffleSecure,type RandomSource} from './random';

export interface TaskResult{position:number;label:string;number:number}

/** Names are user-supplied, so keep only visible, short names and refuse hidden duplicates. */
export function parseParticipantNames(text:string,limit:number):string[]{
  const names=text.split(/\r?\n/).map(v=>v.trim()).filter(Boolean);
  if(names.length<1||names.length>limit)throw new RangeError('Enter between 1 and '+limit+' participants (one per line).');
  if(names.some(n=>n.length>70))throw new RangeError('Each participant label must have at most 70 characters.');
  if(new Set(names.map(n=>n.toLocaleLowerCase('en-US'))).size!==names.length)throw new Error('Please use distinct participant labels.');
  return names;
}
export function assignStations(names:readonly string[],total:number=8,source:RandomSource=cryptoSource):TaskResult[]{
  if(!Number.isSafeInteger(total)||total<2||total>30||names.length>total||names.length<1)throw new RangeError('Invalid group size.');
  const numbers=shuffleSecure(Array.from({length:total},(_,i)=>i+1),source);
  return names.map((label,i)=>({position:i+1,label,number:numbers[i]!}));
}
export function shuffledCallOrder(max:number,excludedText:string='',source:RandomSource=cryptoSource):TaskResult[]{
  if(!Number.isSafeInteger(max)||max<2||max>30)throw new RangeError('Invalid roll-call limit.');
  const excluded=parseExclusions(excludedText);
  if(excluded.some(i=>i<1||i>max))throw new Error('Absent numbers must fall between 1 and '+max+'.');
  const list=numberChoices(1,max,1,excluded);
  if(!list.length)throw new Error('Everyone was marked absent. Restore at least one number.');
  return shuffleSecure(list,source).map((number,i)=>({position:i+1,label:'Student '+number,number}));
}
export function namedRollCall(names:readonly string[],source:RandomSource=cryptoSource):TaskResult[]{
  if(names.length<1||names.length>15)throw new RangeError('Enter 1–15 participants.');
  const shuffled=shuffleSecure(names,source);
  return shuffled.map((label,i)=>({position:i+1,label,number:i+1}));
}
export function sampleNumbers(max:number,count:number,excluded:string,noRepeat:boolean,source:RandomSource=cryptoSource):TaskResult[]{
  if(!Number.isSafeInteger(max)||max<2||max>10000)throw new RangeError('Invalid number range.');
  const absent=parseExclusions(excluded);
  if(absent.some(i=>i<1||i>max))throw new Error('Excluded numbers must fall inside 1–'+max+'.');
  const pool=numberChoices(1,max,1,absent);
  const entries=pool.map(number=>({label:String(number),weight:1}));
  const selections=drawIndices(entries,count,noRepeat,source);
  return selections.map((idx,i)=>({position:i+1,label:String(pool[idx]),number:pool[idx]!}));
}
