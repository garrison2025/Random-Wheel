import {describe,it,expect} from 'vitest';
import {letterChoices,yesNoChoices} from '../src/lib/choice-presets';

describe('letter wheel presets',()=>{
  it('offers 26 equal-weight uppercase letters',()=>{
    const results=letterChoices('all','');
    expect(results).toHaveLength(26);
    expect(results[0]).toEqual({label:'A',weight:1});
    expect(results[25]).toEqual({label:'Z',weight:1});
  });
  it('supports vowels, consonants and optional exclusions',()=>{
    expect(letterChoices('vowels','')).toEqual(['A','E','I','O','U'].map(label=>({label,weight:1})));
    expect(letterChoices('consonants','')).toHaveLength(21);
    const selection=letterChoices('all','q, x z');
    expect(selection).toHaveLength(23);
    expect(selection.map(x=>x.label)).not.toContain('Q');
    expect(letterChoices('vowels','E, U','lower').map(x=>x.label)).toEqual(['a','i','o']);
  });
  it('refuses invalid choices instead of silently changing the selection',()=>{
    expect(()=>letterChoices('all','A,6')).toThrow();
    expect(()=>letterChoices('vowels','A,E,I,O,U')).toThrow('No letters remain');
    expect(()=>letterChoices('invalid','')).toThrow();
    expect(()=>letterChoices('all','','mixed')).toThrow();
  });
});
describe('binary versus ternary decisions',()=>{
  it('assigns equal tickets to Yes/No and Yes/No/Maybe',()=>{
    expect(yesNoChoices('yesno')).toEqual([{label:'Yes',weight:1},{label:'No',weight:1}]);
    expect(yesNoChoices('yesnomaybe')).toEqual([{label:'Yes',weight:1},{label:'No',weight:1},{label:'Maybe',weight:1}]);
  });
  it('rejects unsupported option sets',()=>expect(()=>yesNoChoices('perhaps')).toThrow());
});
