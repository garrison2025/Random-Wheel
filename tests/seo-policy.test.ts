import {describe,it,expect} from 'vitest';
import {resolveSeoPagePolicy} from '../src/lib/seo-policy';

describe('approved page canonical and index separation',()=>{
  it('always emits the official self canonical on an approved page, even in preview',()=>{
    expect(resolveSeoPagePolicy(false,false,'https://numberspinner.com','/')).toEqual({
      indexable:false,canonical:'https://numberspinner.com/',robots:'noindex, nofollow'
    });
    expect(resolveSeoPagePolicy(false,false,'https://numberspinner.com','/random-number-wheel/1-3/')).toEqual({
      indexable:false,canonical:'https://numberspinner.com/random-number-wheel/1-3/',robots:'noindex, nofollow'
    });
  });
  it('keeps held pages canonical-free and noindex in preview and production',()=>{
    for(const path of ['/random-letter-wheel/','/yes-or-no-wheel/','/random-number-wheel/1-7/','/404/']){
      expect(resolveSeoPagePolicy(false,true,'https://numberspinner.com',path))
        .toEqual({indexable:false,robots:'noindex, nofollow'});
      expect(resolveSeoPagePolicy(true,true,'https://numberspinner.com',path))
        .toEqual({indexable:false,robots:'noindex, follow'});
    }
  });
  it('emits the official canonical and index for approved production pages',()=>{
    expect(resolveSeoPagePolicy(true,false,'https://numberspinner.com','/random-number-wheel/1-3/')).toEqual({
      indexable:true,canonical:'https://numberspinner.com/random-number-wheel/1-3/',
      robots:'index, follow, max-image-preview:large'
    });
  });
  it('rejects wrong domains and broken paths on approved pages',()=>{
    for(const domain of ['http://numberspinner.com','https://wheelcanvas.com','https://www.numberspinner.com']){
      expect(()=>resolveSeoPagePolicy(false,false,domain,'/')).toThrow();
      expect(()=>resolveSeoPagePolicy(true,false,domain,'/')).toThrow();
    }
    for(const path of ['wrong-path','//','/foo?x=1','/foo','/Foo/']){
      expect(()=>resolveSeoPagePolicy(true,false,'https://numberspinner.com',path)).toThrow();
    }
  });
});
