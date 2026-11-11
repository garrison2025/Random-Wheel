import {describe,expect,it} from 'vitest';
import {DEFAULT_CUSTOM_WORDS,WORD_GROUPS,wordChoices} from '../src/lib/word-presets';

describe('word wheel categories',()=>{
  it('provides distinct, curated, equal-weight selections for each topic',()=>{
    for(const group of Object.keys(WORD_GROUPS)){
      const entries=wordChoices(group,'ignored');
      expect(entries.length).toBeGreaterThanOrEqual(12);
      expect(new Set(entries.map(e=>e.label.toLocaleLowerCase('en-US'))).size).toBe(entries.length);
      expect(entries.every(e=>e.weight===1)).toBe(true);
    }
  });
  it('supports user word lists and optional weights',()=>{
    expect(wordChoices('custom','Apple\nBanana | 3')).toEqual([{label:'Apple',weight:1},{label:'Banana',weight:3}]);
    expect(wordChoices('custom',DEFAULT_CUSTOM_WORDS).length).toBe(6);
  });
  it('refuses invalid categories and bad user lists',()=>{
    expect(()=>wordChoices('invalid','some words')).toThrow();
    expect(()=>wordChoices('custom','')).toThrow();
    expect(()=>wordChoices('custom','Nope | -1')).toThrow();
    expect(()=>wordChoices('custom','Nope | 0')).toThrow();
  });
});
