import {describe,it,expect} from 'vitest';
import {parseParticipantNames,assignStations,shuffledCallOrder,namedRollCall,sampleNumbers} from '../src/lib/seo-workflows';
import type {RandomSource} from '../src/lib/random';
const zeros:RandomSource=(a)=>{a.fill(0);return a;};
describe('candidate workflow user value',()=>{
 it('validates distinct names, length and participant bounds',()=>{
   expect(parseParticipantNames(' Alice \n Bob ',8)).toEqual(['Alice','Bob']);
   expect(()=>parseParticipantNames('A\na',8)).toThrow('distinct');
   expect(()=>parseParticipantNames('',8)).toThrow();
   expect(()=>parseParticipantNames('a\nb\nc',2)).toThrow();
 });
 it('assigns a distinct numbered station for each team',()=>{
   const values=assignStations(['Alpha','Beta','Gamma'],8,zeros);
   expect(values.map(x=>x.label)).toEqual(['Alpha','Beta','Gamma']);
   expect(new Set(values.map(x=>x.number)).size).toBe(3);
   expect(values.every(x=>x.number>=1&&x.number<=8)).toBe(true);
 });
 it('excludes absent numbers and generates a full roll-call order',()=>{
   const rows=shuffledCallOrder(30,'1, 9, 30',zeros);
   expect(rows).toHaveLength(27);
   expect(rows.some(r=>[1,9,30].includes(r.number))).toBe(false);
   expect(new Set(rows.map(x=>x.number)).size).toBe(27);
   expect(()=>shuffledCallOrder(30,'31',zeros)).toThrow();
 });
 it('generates a unique teacher roster order',()=>{
   const rows=namedRollCall(['Anna','Ben','Cole'],zeros);
   expect(rows).toHaveLength(3);
   expect(new Set(rows.map(x=>x.label)).size).toBe(3);
 });
 it('samples up to 100 unique or repeated numbers with exclusions',()=>{
   const results=sampleNumbers(1000,100,'11, 99',true,zeros);
   expect(results).toHaveLength(100);
   expect(new Set(results.map(r=>r.number)).size).toBe(100);
   expect(results.some(r=>[11,99].includes(r.number))).toBe(false);
   expect(sampleNumbers(10,3,'',false,zeros).map(x=>x.number)).toEqual([1,1,1]);
   expect(()=>sampleNumbers(10,10,'1',true,zeros)).toThrow('not enough');
 });
});
