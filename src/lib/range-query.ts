/** Query-driven range shortcuts do not create new crawlable HTML pages.
 * All links resolve to the existing /random-number-wheel/ URL and retain
 * its canonical. Never infer a new SEO landing from URL parameters.
 */
export type NumericRangePreset = {min:number;max:number};
export function parseNumericRangeQuery(search:string):NumericRangePreset|null{
  const params=new URLSearchParams(search);
  if(params.getAll('min').length!==1||params.getAll('max').length!==1)return null;
  const a=params.get('min')??'',b=params.get('max')??'';
  if(!/^[1-9]\d{0,4}$/.test(a)||!/^[1-9]\d{0,4}$/.test(b))return null;
  const min=Number(a),max=Number(b);
  if(!Number.isSafeInteger(min)||!Number.isSafeInteger(max)||min>max||max>10000)return null;
  return {min,max};
}
