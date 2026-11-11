import {describe,it,expect} from 'vitest';
import {scoreDecisionRound} from '../src/lib/decision-round';
describe('independent yes/no decision rounds',()=>{
 it('finishes binary best-of-three immediately when one answer reaches two',()=>{
   expect(scoreDecisionRound({Yes:2,No:0,Maybe:0},'yesno',true)).toEqual({complete:true,winner:'Yes',tied:false,draws:2});
 });
 it('requires the third draw if the binary answers split 1-1',()=>{
   expect(scoreDecisionRound({Yes:1,No:1,Maybe:0},'yesno',true).complete).toBe(false);
   expect(scoreDecisionRound({Yes:2,No:1,Maybe:0},'yesno',true).winner).toBe('Yes');
 });
 it('completes ternary rounds after three and permits a three-way tie',()=>{
   expect(scoreDecisionRound({Yes:2,No:0,Maybe:0},'yesnomaybe',true).complete).toBe(false);
   expect(scoreDecisionRound({Yes:1,No:1,Maybe:1},'yesnomaybe',true)).toEqual({complete:true,winner:null,tied:true,draws:3});
   expect(scoreDecisionRound({Yes:1,No:0,Maybe:2},'yesnomaybe',true).winner).toBe('Maybe');
 });
 it('does not force a winner when tally-only mode is enabled',()=>{
   expect(scoreDecisionRound({Yes:2,No:0},'yesno',false).complete).toBe(false);
 });
});
