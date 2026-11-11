
export function escapeCsvCell(value:string):string{
  // Prevent spreadsheet formula execution when a user opens exported data.
  const safe=/^[\s]*[=+@-]/.test(value) ? "'"+value : value;
  return '"'+safe.replace(/"/g,'""')+'"';
}
export function historyAsCsv(history:readonly string[]):string{
  const rows=['Draw,Result'];
  for(let i=0;i<history.length;i++) rows.push((i+1)+','+escapeCsvCell(history[i]!));
  return '\uFEFF'+rows.join('\r\n')+'\r\n';
}
export function historyAsText(history:readonly string[]):string{
  return history.map((result,i)=>(i+1)+'. '+result).join('\n')+'\n';
}
