import {describe,expect,it} from 'vitest';
import {isOfficialIndexDomain} from '../src/lib/site';

describe('SEO indexing domain gate',()=>{
  it('accepts ordinary official custom HTTPS domains',()=>{
    expect(isOfficialIndexDomain('https://numberspinner.com')).toBe(true);
    expect(isOfficialIndexDomain('https://www.numberspinner.com')).toBe(true);
  });
  it('rejects preview aliases and placeholder domains',()=>{
    for(const domain of [
      'https://random-wheel-58c.pages.dev','https://pages.dev',
      'https://example.com','https://www.example.com',
      'https://sub.example.co.uk','https://a.example.org'
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