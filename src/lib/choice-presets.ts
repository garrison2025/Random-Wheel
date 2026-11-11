import type {Entry} from './random';

export const ALPHABET='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const VOWELS='AEIOU';
export const CONSONANTS=Array.from(ALPHABET).filter(letter=>!VOWELS.includes(letter)).join('');

/** Alphabet pools have equal ticket weight for every included letter. */
export function letterChoices(set:string, excluded:string, letterCase:string='upper'):Entry[] {
  const pools:Record<string,string>={all:ALPHABET,vowels:VOWELS,consonants:CONSONANTS,game:'ABCDEFGHIJKLMNOPRSTW'};
  if(!Object.hasOwn(pools,set)) throw new Error('Choose a valid alphabet preset.');
  if(!['upper','lower'].includes(letterCase))throw new Error('Choose uppercase or lowercase letters.');
  if(excluded.length>180 || !/^[a-zA-Z,\s]*$/.test(excluded)) throw new Error('Excluded letters must be A–Z separated by commas or spaces.');
  const forbidden=new Set(excluded.toUpperCase().replace(/[^A-Z]/g,'').split(''));
  const available=[...pools[set]!].filter(letter=>!forbidden.has(letter));
  if(!available.length)throw new Error('No letters remain. Remove some exclusions.');
  return available.map(letter=>({label:letterCase==='lower'?letter.toLowerCase():letter,weight:1}));
}

export function yesNoChoices(choiceMode:string):Entry[]{
  if(choiceMode==='yesno')return [{label:'Yes',weight:1},{label:'No',weight:1}];
  if(choiceMode==='yesnomaybe')return [{label:'Yes',weight:1},{label:'No',weight:1},{label:'Maybe',weight:1}];
  throw new Error('Choose a valid Yes/No decision mode.');
}
