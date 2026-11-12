import {describe,expect,it} from 'vitest';
import {APPROVED_RANGE_GUIDES,APPROVED_GUIDE_RANGES} from '../src/data/approved-range-guides';

describe('approved number range content quality',()=>{
  it('has exactly the six launch-eligible ranges',()=>{
    expect([...APPROVED_GUIDE_RANGES]).toEqual([3,4,5,6,20,100]);
    expect(Object.keys(APPROVED_RANGE_GUIDES).map(Number).sort((a,b)=>a-b))
      .toEqual([3,4,5,6,20,100]);
  });
  it('contains two actionable and nonduplicate examples for every range',()=>{
    const headings=new Set<string>();
    const titles=new Set<string>();
    for(const max of APPROVED_GUIDE_RANGES){
      const guide=APPROVED_RANGE_GUIDES[max];
      expect(guide.heading.length).toBeGreaterThan(18);
      expect(guide.intro.length).toBeGreaterThan(40);
      expect(guide.distinction.length).toBeGreaterThan(40);
      expect(headings.has(guide.heading)).toBe(false);
      headings.add(guide.heading);
      expect(guide.examples).toHaveLength(2);
      for(const example of guide.examples){
        expect(titles.has(example.title)).toBe(false);
        titles.add(example.title);
        expect(example.steps).toHaveLength(3);
        example.steps.forEach(step=>expect(step.length).toBeGreaterThan(20));
        expect(example.outcome.length).toBeGreaterThan(40);
        expect(example.preset.batch).toBeGreaterThanOrEqual(1);
        expect(example.preset.batch).toBeLessThanOrEqual(100);
        expect(['quick','spin']).toContain(example.preset.mode);
        if(example.preset.remove)expect(example.preset.batch).toBeLessThanOrEqual(max);
        if(example.preset.exclude)expect(max).toBe(20);
      }
    }
    expect(headings.size).toBe(6);
    expect(titles.size).toBe(12);
  });
  it('distinguishes independent picks from no-repeat assignments',()=>{
    expect(APPROVED_RANGE_GUIDES[6].examples[0].outcome).toMatch(/allow repeats/);
    expect(APPROVED_RANGE_GUIDES[6].examples[1].outcome).toMatch(/once/);
    expect(APPROVED_RANGE_GUIDES[20].examples[0].outcome).toMatch(/Absent numbers will not be drawn/);
    expect(APPROVED_RANGE_GUIDES[100].examples[1].outcome).toMatch(/Ten different numbers/);
  });
});
