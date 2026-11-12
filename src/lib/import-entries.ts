import {parseEntries} from './random';

/**
 * CSV with a Name column and optional Weight column.
 * Reject malformed quotes instead of silently altering tickets/probabilities.
 */
export function csvRows(content:string):string[][] {
  const rows:string[][]=[];
  let cells:string[]=[];
  let current='';
  let quoted=false;
  let quotedClosed=false;
  let began=false;
  const finishCell=()=>{
    cells.push(current);
    current='';
    quotedClosed=false;
    began=false;
  };
  const finishRow=()=>{
    finishCell();
    if(cells.some(c=>c.trim()))rows.push(cells);
    cells=[];
  };
  for(let i=0;i<content.length;i++){
    const ch=content[i]!;
    if(quoted){
      if(ch==='"'&&content[i+1]==='"'){current+='"';i++;}
      else if(ch==='"'){quoted=false;quotedClosed=true;}
      else current+=ch;
      continue;
    }
    if(ch==='"'){
      if(began && current.trim())throw new Error('Malformed CSV quoting; quote an entire field.');
      current='';quoted=true;began=true;
    }else if(ch===','){
      finishCell();
    }else if(ch==='\r'||ch==='\n'){
      if(ch==='\r'&&content[i+1]==='\n')i++;
      finishRow();
    }else if(quotedClosed){
      if(!/\s/.test(ch))throw new Error('Unexpected text after a quoted CSV field.');
    }else{
      current+=ch;
      began=true;
    }
  }
  if(quoted)throw new Error('The CSV file has an unclosed quoted field.');
  finishRow();
  return rows;
}

/** Validate imported tickets before touching the browser's active choices. */
export function parseImportedEntryLines(content:string,filename:string):string[] {
  const isCsv=filename.toLowerCase().endsWith('.csv');
  const rows=isCsv?csvRows(content):content.split(/\r?\n/).map(line=>[line]);
  if(isCsv && rows.length &&
    rows[0]![0]?.trim().toLowerCase()==='name' &&
    rows[0]![1]?.trim().toLowerCase()==='weight')rows.shift();
  if(rows.length>100)throw new Error('Import at most 100 entries.');
  const lines=rows.filter(row=>row.some(cell=>cell.trim())).map(row=>{
    if(row.length>2)throw new Error('CSV should contain Name and optional Weight columns only.');
    const name=(row[0]||'').trim();
    if(!name)throw new Error('Each imported entry needs a name.');
    if(/[\r\n|]/.test(name))throw new Error('A name contains a line break or |. Change it before importing to avoid altered draw probabilities.');
    if(row.length===2){
      const weight=(row[1]||'').trim();
      if(!/^\d+$/.test(weight))throw new Error('CSV weights must be whole numbers.');
      return name+' | '+weight;
    }
    return name;
  });
  if(!lines.length)throw new Error('The file contains no usable entries.');
  parseEntries(lines.join('\n'));
  return lines;
}
