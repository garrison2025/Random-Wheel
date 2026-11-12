/** Public, code-backed facts for explainable Number Spinner tools.
 * A single source for visible facts and matching WebApplication markup.
 * Never label code behavior as independently audited/certified.
 */
export type GeoTool = 'custom' | 'number-wheel' | 'range';
export type GeoToolFacts = {
  name:string; path:string; summary:string; outcome:string;
  methods:string; exclusions:string; privacy:string;
  features:string[];
};
export function geoToolFacts(kind:GeoTool,max?:number):GeoToolFacts{
  if(kind==='custom'){
    return {
      name:'Spin the Wheel — Custom Choice Picker',path:'/',
      summary:'Create a wheel from your own names or choices and choose one at random. Each line is one entry; optional integer weights change selection probabilities.',
      outcome:'Quick Pick returns one result immediately. Spin Wheel reveals a preselected result with an animation.',
      methods:'Unweighted entries have equal chances. A weight of 3 gives one entry three times the selection weight of an entry with weight 1.',
      exclusions:'Remove winners removes a selected entry from later draws in that round. Duplicate names on different lines remain separate entries.',
      privacy:'The draw and list processing run in your browser. Saved wheels use local browser storage; shared links include the configuration in the URL fragment.',
      features:['Custom names and choices','Optional integer weights','Instant pick and animated reveal','Remove winners','Local save and share configuration']
    };
  }
  if(kind==='number-wheel'){
    return {
      name:'Random Number Wheel — Custom Range',path:'/random-number-wheel/',
      summary:'Choose a starting integer, ending integer and positive step; then pick from the eligible values. Excluded numbers are not drawn.',
      outcome:'Quick Pick gives an immediate number. Spin Wheel uses the same selection method with an animation; large ranges show simplified wheel graphics.',
      methods:'Eligible values receive equal chance on independent draws. Browser Web Crypto randomness and rejection sampling avoid modulo bias.',
      exclusions:'Choose 1–100 results per draw, optionally without replacement. The eligible range may contain up to 10,000 numbers.',
      privacy:'Number settings and random picks are processed locally in the browser. Sharing a setup includes its settings in the share link.',
      features:['Custom integer range','Step intervals','Excluded numbers','Instant result or wheel spin','Up to 100 results per draw','No-repeat draws','CSV and TXT export']
    };
  }
  if(max === undefined || !Number.isSafeInteger(max) || max < 1 || max > 100)throw new RangeError('GEO facts require an approved 1–N range.');
  const number=max;
  const noun=number===3?'three-way decisions':number===4?'four-way assignments':number===5?'five-option tasks':number===6?'six-sided-die-style decisions':number===20?'classroom roll calls':'1–100 numbered picks';
  return {
    name:'Random Number 1–'+number,
    path:'/random-number-wheel/1-'+number+'/',
    summary:'Pick an integer from 1 through '+number+' (inclusive) for '+noun+'. Every number starts as an eligible outcome.',
    outcome:number===100
      ?'The phone-friendly instant action returns a number without waiting for a wheel animation; Spin Wheel remains available.'
      :'Quick Pick returns a number immediately; Spin Wheel reveals the selected number visually.',
    methods:'With default 1–'+number+' settings and no exclusions, a fresh independent draw gives each number probability 1/'+number+' ('+(100/number).toFixed(2)+'%). The animation does not determine the random result.',
    exclusions:'Remove winners prevents the same numbered entry being selected twice in a round; exclusions or step changes alter the eligible pool.',
    privacy:'Selection happens in the browser using Web Crypto; there is no account requirement. Optional share links contain your selected settings.',
    features:['Preloaded 1–'+number+' range','Browser-secure random selection','Instant pick and animated wheel','Excluded numbers','Optional no-repeat draws','Batch drawing and export']
  };
}
export const LAUNCH_GEO_TOOL_PATHS=[
  '/', '/random-number-wheel/', '/random-number-wheel/1-3/',
  '/random-number-wheel/1-4/', '/random-number-wheel/1-5/',
  '/random-number-wheel/1-6/', '/random-number-wheel/1-20/',
  '/random-number-wheel/1-100/'
] as const;
