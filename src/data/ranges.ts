
export type RangePage = {
  slug:string; max:number; title:string; description:string; headline:string; intro:string;
  context:string; guide:string; tip:string; queries:string[]; example:string;
};
export const RANGE_PAGES: RangePage[] = [
  {
    slug:'1-3',max:3,title:'Pick a Number 1–3 | Fair Random 1 to 3 Picker',
    description:'Instantly pick a random number from 1 to 3. Try a simple three-way spinner, remove picked numbers, or get an instant result.',
    headline:'Pick a Number from 1 to 3',intro:'Three choices. One fair result. Use the quick picker or see each choice on the animated wheel.',
    context:'Choose between three teams, assign one of three discussion prompts, or select a turn during a classroom activity.',
    guide:'Set the range to 1–3 and choose Quick Pick for an immediate answer. Spin Wheel shows three equally sized sectors so every number has a one-in-three chance.',
    tip:'Switch on “Remove winners” to assign the three numbers without choosing the same one twice.',
    queries:['pick a number 1-3','pick number 1-3'],example:'Three teams, three tasks, one impartial choice.'
  },
  {
    slug:'1-4',max:4,title:'Random Number 1–4 | Free Four-Choice Number Picker',
    description:'Pick a number from 1 to 4 with a fair wheel or quick random result. Ideal for four groups, stations and turn-taking.',
    headline:'Random Number 1 to 4',intro:'A balanced four-choice wheel for assigning groups, stations or turns without bias.',
    context:'Divide participants into four teams or select one of four classroom stations. Exclude an unavailable option before drawing.',
    guide:'This 1–4 preset has four equal sectors by default. Use the exclusion field to remove an option or choose Remove winners for allocation without replacement.',
    tip:'If you need to choose exactly one of four equally likely outcomes, leave all four options active.',
    queries:['number randomizer 1-4','random number 1-4'],example:'Four corners, four teams, or four activity stations.'
  },
  {
    slug:'1-5',max:5,title:'Pick a Number 1–5 | Instant Number Generator & Wheel',
    description:'Free random 1–5 number picker with a visible wheel, instant results, repeat-free selection and a clear history.',
    headline:'Pick a Number from 1 to 5',intro:'Make a fair five-way choice in one click, or spin the wheel to reveal the result.',
    context:'Useful for choosing from five people, ranking five activities, or randomly assigning five numbered tasks.',
    guide:'Pick a number immediately for speed, or choose Spin Wheel to see five even sectors. Toggle Remove winners to draw each number once.',
    tip:'Use the history to confirm which numbers were already picked before a new round.',
    queries:['pick a number 1-5','1-5 random number generator'],example:'Five activities, one decision, no complicated setup.'
  },
  {
    slug:'1-6',max:6,title:'Random Number 1–6 | Fair Six-Sided Dice Picker',
    description:'Generate a fair number between 1 and 6 or spin a six-sector wheel. A simple online dice alternative.',
    headline:'Random Number 1 to 6',intro:'An online six-sided draw: a number picker when you need speed, a colorful wheel when you need suspense.',
    context:'Run a dice-like classroom game or assign one of six turns. Each number has an equal chance while all six are active.',
    guide:'Quick Pick acts like rolling a fair six-sided die; Spin Wheel illustrates the same six possibilities. For repeated dice rolls, keep Remove winners off.',
    tip:'For a normal dice-style activity, allow repeats; for assigning six different tasks, remove winners.',
    queries:['random number generator 1-6','random number between 1 and 6'],example:'Six sides, six possibilities, equal odds.'
  },
  {
    slug:'1-20',max:20,title:'Random Number 1–20 | Classroom Number Picker',
    description:'Pick random numbers from 1 to 20. Exclude absent student numbers, select without repeats, and view your drawing history.',
    headline:'Random Number 1 to 20',intro:'Draw from twenty numbers to call on students, organize a rotation or distribute numbered activities.',
    context:'Ideal for a class list numbered 1–20. Exclude absent numbers and turn on Remove winners so everyone gets a turn.',
    guide:'Use Quick Pick to choose a number instantly. For a live presentation, Spin Wheel shows all twenty candidates with a matching final result.',
    tip:'Add absent student numbers to exclusions so the draw never selects them.',
    queries:['random number 1-20','number generator 1-20'],example:'Classroom seating numbers and fair participation.'
  },
  {
    slug:'1-100',max:100,title:'Random Number Generator 1–100 | Quick Pick or Spin Wheel',
    description:'Instantly generate a random number from 1 to 100. Set exclusions, choose without replacement, or switch to a visual wheel.',
    headline:'Random Number Generator 1 to 100',intro:'Get one random number between 1 and 100 instantly. Prefer a visual reveal? Switch to wheel mode.',
    context:'Use 1–100 for tickets, numbered worksheets, classroom draws or general number selection. The quick picker is optimized for immediate results.',
    guide:'Quick Pick selects among all 100 values without drawing 100 unreadable sectors. The optional animated reveal represents the draw without pretending to display every value.',
    tip:'Use exclusions and Remove winners to avoid repeated tickets or unavailable numbers.',
    queries:['random number generator 1-100','choose a number from 1 to 100'],example:'One to one hundred, ready for a fair draw.'
  }
];
export const RANGE_MAP = new Map(RANGE_PAGES.map(p=>[p.slug,p]));
