import {parseEntries,type Entry} from './random';

export const WORD_GROUPS={
  classroom:['Explore','Observe','Compare','Explain','Create','Discuss','Question','Imagine','Measure','Practice','Discover','Reflect','Describe','Organize','Invent','Share'],
  nouns:['River','Mountain','Lantern','Garden','Ocean','Forest','Bridge','Clock','Planet','Window','Library','Puzzle','Island','Camera','Castle','Bicycle'],
  verbs:['Explore','Build','Listen','Create','Travel','Imagine','Sketch','Discover','Celebrate','Whisper','Balance','Gather','Transform','Climb','Notice','Design'],
  adjectives:['Curious','Brave','Gentle','Vivid','Bright','Quiet','Playful','Kind','Clever','Bold','Patient','Calm','Creative','Warm','Lively','Thoughtful'],
  story:['A hidden door','The last train','A strange letter','An old map','A surprise visitor','A silent town','A lost key','The first snowfall','A secret garden','A midnight call','An unexpected gift','A forgotten song']
} as const;
export type WordGroup=keyof typeof WORD_GROUPS | 'custom';

export const DEFAULT_CUSTOM_WORDS='Sunshine\nAdventure\nKindness\nDiscovery\nWonder\nHarmony';

export function wordChoices(group:string,custom:string):Entry[]{
  if(group==='custom'){
    const choices=parseEntries(custom);
    if(!choices.some(x=>x.weight>0))throw new Error('At least one word needs a positive weight.');
    return choices;
  }
  if(!Object.prototype.hasOwnProperty.call(WORD_GROUPS,group))throw new Error('Choose a valid word category.');
  const list=WORD_GROUPS[group as keyof typeof WORD_GROUPS];
  return list.map(label=>({label,weight:1}));
}
