import {describe,it,expect} from 'vitest';
import {parseNumericRangeQuery} from '../src/lib/range-query';
describe('canonical-safe range query shortcuts',()=>{
  it('parses a valid range and ignores tracking parameters',()=>{
    expect(parseNumericRangeQuery('?min=1&max=9')).toEqual({min:1,max:9});
    expect(parseNumericRangeQuery('?utm_source=blog&max=14&min=1')).toEqual({min:1,max:14});
    expect(parseNumericRangeQuery('?min=3&max=10000')).toEqual({min:3,max:10000});
  });
  it('rejects missing, duplicated, invalid and out of bounds values',()=>{
    for(const q of ['', '?max=9', '?min=1','?min=1&min=2&max=9',
      '?min=0&max=9','?min=-1&max=9','?min=9&max=8','?min=1&max=10001',
      '?min=1.5&max=9','?min=1&max=Infinity','?min=0x1&max=9']){
      expect(parseNumericRangeQuery(q)).toBeNull();
    }
  });
});
