import {describe,expect,it} from 'vitest';
import {isOfficialIndexDomain,shouldIndexApprovedPages} from '../src/lib/site';

describe('SEO indexing domain gate',()=>{
  it('accepts ordinary official custom HTTPS domains',()=>{
    expect(isOfficialIndexDomain('https://numberspinner.com')).toBe(true);
    expect(isOfficialIndexDomain('https://www.numberspinner.com')).toBe(false);
  });
  it('rejects preview aliases and placeholder domains',()=>{
    for(const domain of [
      'https://random-wheel-58c.pages.dev','https://pages.dev',
      'https://example.com','https://www.example.com',
      'https://sub.example.co.uk','https://a.example.org',
      'https://wheelcanvas.com','https://another-custom-domain.com'
    ]) expect(isOfficialIndexDomain(domain)).toBe(false);
  });
  it('rejects non-HTTPS and URLs containing paths, ports, or query strings',()=>{
    for(const domain of [
      'http://numberspinner.com','https://localhost',
      'https://wheelcanvas.com/subpath','https://wheelcanvas.com:443',
      'https://wheelcanvas.com?hello=yes','https://wheelcanvas..com',
      'not-a-url'
    ]) expect(isOfficialIndexDomain(domain)).toBe(false);
  });
});
describe('Cloudflare Pages official deployment indexing',()=>{
  const origin='https://numberspinner.com';
  it('automatically enables launch URLs only for the Cloudflare main production build',()=>{
    expect(shouldIndexApprovedPages(origin,undefined,'1','main')).toBe(true);
    expect(shouldIndexApprovedPages(origin,undefined,'1','preview')).toBe(false);
    expect(shouldIndexApprovedPages(origin,undefined,undefined,'main')).toBe(false);
    expect(shouldIndexApprovedPages(origin,undefined,'1',undefined)).toBe(false);
  });
  it('supports explicit overrides without accidentally indexing preview',()=>{
    expect(shouldIndexApprovedPages(origin,'false','1','main')).toBe(false);
    expect(shouldIndexApprovedPages(origin,'true',undefined,undefined)).toBe(true);
    expect(shouldIndexApprovedPages(origin,'true','1','feature')).toBe(true);
    expect(shouldIndexApprovedPages('https://random-wheel-58c.pages.dev','true','1','main')).toBe(false);
    expect(shouldIndexApprovedPages('https://www.numberspinner.com','true','1','main')).toBe(false);
  });
});
