import {describe,expect,it} from 'vitest';
import {csvRows,parseImportedEntryLines} from '../src/lib/import-entries';

describe('CSV input parsing',()=>{
  it('understands quoted commas, escaped quotes, and CRLF files',()=>{
    expect(csvRows('Name,Weight\r\n"Alice, Jr",3\r\n"Jo""an",2\r\n'))
      .toEqual([['Name','Weight'],['Alice, Jr','3'],['Jo"an','2']]);
    expect(parseImportedEntryLines('Name,Weight\r\n"Alice, Jr",3\r\nBob,1\r\n','winners.csv'))
      .toEqual(['Alice, Jr | 3','Bob | 1']);
  });
  it('retains optional weights and accepts unweighted text files',()=>{
    expect(parseImportedEntryLines('One | 2\nTwo\n','list.txt')).toEqual(['One | 2','Two']);
    expect(parseImportedEntryLines('Alice\nBob\n','names.csv')).toEqual(['Alice','Bob']);
  });
  it('rejects blank and invalid weights rather than silently zeroing a ticket',()=>{
    expect(()=>parseImportedEntryLines('Name,Weight\nAlice,\n','names.csv'))
      .toThrow('weights must be whole numbers');
    expect(()=>parseImportedEntryLines('Name,Weight\nAlice,abc\n','names.csv'))
      .toThrow('weights must be whole numbers');
    expect(()=>parseImportedEntryLines('Alice |\n','names.txt')).toThrow();
    expect(()=>parseImportedEntryLines('Name,Weight\nAlice,10001\n','names.csv')).toThrow();
  });
  it('fails closed for malformed CSV or labels that cannot survive the textarea format',()=>{
    expect(()=>csvRows('Name,Weight\n"Alice,2\n')).toThrow('unclosed quoted field');
    expect(()=>csvRows('Name,Weight\nAlice"X,2\n')).toThrow('Malformed CSV');
    expect(()=>csvRows('Name,Weight\n"Alice"X,2\n')).toThrow('Unexpected text');
    expect(()=>parseImportedEntryLines('Name,Weight\n"Alice\nAdmin",2\n','names.csv'))
      .toThrow('line break');
    expect(()=>parseImportedEntryLines('Name,Weight\n,Alice\n','names.csv'))
      .toThrow('needs a name');
    expect(()=>parseImportedEntryLines('Name,Weight\n"Alice|Bob",2\n','names.csv'))
      .toThrow('line break or |');
  });
  it('rejects unsupported extra columns and empty inputs',()=>{
    expect(()=>parseImportedEntryLines('Alice,2,extra\n','names.csv')).toThrow('optional Weight');
    expect(()=>parseImportedEntryLines('\n','names.csv')).toThrow('no usable entries');
    expect(()=>parseImportedEntryLines(Array.from({length:101},(_,i)=>'Name'+i).join('\n'),'names.txt'))
      .toThrow('at most 100');
  });
});
