import {describe,expect,it} from 'vitest';
import {geoToolFacts,LAUNCH_GEO_TOOL_PATHS} from '../src/lib/geo-tool-facts';
import {APPROVED_GUIDE_RANGES} from '../src/data/approved-range-guides';
import {LAUNCH_ROUTES} from '../src/lib/site';

describe('GEO: only real, already-index-approved tool facts',()=>{
  it('covers the home, number pillar and exactly six approved ranges',()=>{
    const expected=['/','/random-number-wheel/',...APPROVED_GUIDE_RANGES.map(n=>'/random-number-wheel/1-'+n+'/')];
    expect([...LAUNCH_GEO_TOOL_PATHS]).toEqual(expected);
    expect(LAUNCH_GEO_TOOL_PATHS.every(path=>LAUNCH_ROUTES.includes(path as typeof LAUNCH_ROUTES[number]))).toBe(true);
    const facts=[
      geoToolFacts('custom'),geoToolFacts('number-wheel'),
      ...APPROVED_GUIDE_RANGES.map(n=>geoToolFacts('range',n))
    ];
    expect(facts.map(x=>x.path)).toEqual(expected);
    expect(new Set(facts.map(x=>x.name)).size).toBe(8);
    for(const item of facts){
      expect(item.summary.length).toBeGreaterThan(60);
      expect(item.methods.length).toBeGreaterThan(80);
      expect(item.features.length).toBeGreaterThanOrEqual(5);
      expect(item.privacy.toLowerCase()).toMatch(/browser/);
      expect(item.name).not.toMatch(/certified|approved|best|verified/i);
    }
  });
  it('explains the independent 1/N draw and never promises those odds after exclusions',()=>{
    for(const maximum of APPROVED_GUIDE_RANGES){
      const facts=geoToolFacts('range',maximum);
      expect(facts.methods).toContain('1/'+maximum);
      expect(facts.methods).toContain((100/maximum).toFixed(2)+'%');
      expect(facts.methods).toMatch(/default|no exclusions/i);
      expect(facts.exclusions).toMatch(/eligible pool/i);
    }
  });
  it('rejects invalid ranges rather than manufacturing GEO page facts',()=>{
    for(const n of [0,-1,101,10000,1.5,NaN]){
      expect(()=>geoToolFacts('range',n)).toThrow();
    }
    expect(()=>geoToolFacts('range')).toThrow();
  });
});
