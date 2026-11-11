import {describe,it,expect} from 'vitest';
import {resolveSeoPagePolicy} from '../src/lib/seo-policy';

describe('independent release gate for index eligibility',()=>{
  it('keeps preview pages noindex without canonical',()=>{
    expect(resolveSeoPagePolicy(false,false,'','/')).toEqual({indexable:false,robots:'noindex, nofollow'});
  });
  it('keeps held candidate pages noindex and canonical-free even if official indexing is enabled',()=>{
    for(const path of ['/random-letter-wheel/','/yes-or-no-wheel/','/random-number-wheel/1-8/']){
      expect(resolveSeoPagePolicy(true,true,'https://wheelcanvas.com',path)).toEqual({indexable:false,robots:'noindex, nofollow'});
    }
  });
  it('emits canonical only for approved pages with valid official URL',()=>{
    expect(resolveSeoPagePolicy(true,false,'https://wheelcanvas.com','/random-number-wheel/1-3/')).toEqual({
      indexable:true,canonical:'https://wheelcanvas.com/random-number-wheel/1-3/',
      robots:'index, follow, max-image-preview:large'
    });
  });
  it('requires absolute HTTPS domain when indexing',()=>{
    expect(()=>resolveSeoPagePolicy(true,false,'http://wheelcanvas.com','/')).toThrow();
    expect(()=>resolveSeoPagePolicy(true,false,'https://wheelcanvas.com','wrong-path')).toThrow();
  });
});
