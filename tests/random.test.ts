import {escapeCsvCell,historyAsCsv,historyAsText} from '../src/lib/export';

import {describe,expect,it} from 'vitest';
import {numberChoices,parseEntries,parseExclusions,pickEntry,secureIndex,weightedIndex,drawIndices,shuffleSecure,type RandomSource} from '../src/lib/random';
const source = (...values:number[]): RandomSource => {
  let i=0;
  return (buffer)=>{buffer[0]=values[i++] ?? 0;return buffer;};
};
describe('unbiased integer selection',()=>{
  it('keeps results in range',()=>{expect(secureIndex(1,source(4294967295))).toBe(0);expect(secureIndex(100,source(99))).toBe(99);});
  it('rejects biased tail instead of reducing it modulo count',()=>expect(secureIndex(3,source(4294967295,2))).toBe(2));
  it('rejects zero and invalid candidate sizes',()=>{expect(()=>secureIndex(0,source(0))).toThrow();expect(()=>secureIndex(-1,source(0))).toThrow();});
  it('covers the upper edge of the 32-bit random space',()=>expect(secureIndex(2,source(4294967295))).toBe(1));
});
describe('weights and no-repeat primitives',()=>{
  it('uses integer ticket weights',()=>{
    expect(weightedIndex([1,2,0],source(0))).toBe(0);
    expect(weightedIndex([1,2,0],source(1))).toBe(1);
    expect(weightedIndex([1,2,0],source(2))).toBe(1);
    expect(pickEntry([{label:'zero',weight:0},{label:'one',weight:1}],source(0))).toBe(1);
  });
  it('does not accept invalid weights',()=>{
    expect(()=>weightedIndex([0,0],source(0))).toThrow();
    expect(()=>weightedIndex([1,-1],source(0))).toThrow();
    expect(()=>weightedIndex([0.25,1],source(0))).toThrow();
  });
});
describe('number range calculations',()=>{
  it('supports step sizes and excludes unavailable values',()=>expect(numberChoices(1,10,2,[3,7])).toEqual([1,5,9]));
  it('supports negative range boundaries',()=>expect(numberChoices(-2,2)).toEqual([-2,-1,0,1,2]));
  it('handles all numbers excluded',()=>expect(numberChoices(1,3,1,[1,2,3])).toEqual([]));
  it('rejects very large ranges',()=>expect(()=>numberChoices(1,10001)).toThrow());
  it('rejects fractional and reversed ranges',()=>{
    expect(()=>numberChoices(1,3.2)).toThrow();
    expect(()=>numberChoices(4,2)).toThrow();
    expect(()=>numberChoices(1,5,0)).toThrow();
  });
});
describe('safe entry parsing',()=>{
  it('supports explicit integer weights without merging duplicate labels',()=>expect(parseEntries('Alex | 3\nAlex\nCasey | 0')).toEqual([{label:'Alex',weight:3},{label:'Alex',weight:1},{label:'Casey',weight:0}]));
  it('parses exclusion lists',()=>expect(parseExclusions('2, 4; 6')).toEqual([2,4,6]));
  it('rejects invalid inputs',()=>{
    expect(()=>parseEntries('')).toThrow();
    expect(()=>parseEntries('Alex | -2')).toThrow();
    expect(()=>parseEntries('Alex |')).toThrow();
    expect(()=>parseEntries('Alex |    ')).toThrow();
    expect(()=>parseEntries('Alex | garbage')).toThrow();
    expect(()=>parseExclusions('4, x')).toThrow();
  });
});


describe('batch draws and export safety',()=>{
  it('supports repeated weighted picks',()=>expect(drawIndices([{label:'A',weight:1},{label:'B',weight:3}],3,false,source(0,2,3))).toEqual([0,1,1]));
  it('draws distinct indices when not replacing winners',()=>expect(drawIndices([{label:'A',weight:1},{label:'B',weight:1},{label:'C',weight:1}],3,true,source(0,0,0))).toEqual([0,1,2]));
  it('refuses invalid or impossible batches',()=>{
    expect(()=>drawIndices([{label:'A',weight:1}],101)).toThrow();
    expect(()=>drawIndices([{label:'A',weight:1}],2,true)).toThrow();
    expect(()=>drawIndices([{label:'A',weight:0}],1)).toThrow();
  });
  it('shuffles deterministically with injected secure randomness',()=>expect(shuffleSecure(['A','B','C'],source(0,0))).toEqual(['B','C','A']));
  it('escapes spreadsheet formulas and quotes in CSV cells',()=>{
    expect(escapeCsvCell('=2+3')).toBe("\"'=2+3\"");
    expect(escapeCsvCell('ab\"cd')).toBe("\"ab\"\"cd\"");
    expect(historyAsCsv(['Alpha','Beta'])).toContain('1,"Alpha"\r\n2,"Beta"');
    expect(historyAsText(['10','2'])).toBe('1. 10\n2. 2\n');
  });
});
