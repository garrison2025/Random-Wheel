
export type RangePage = {
  slug:string; max:number; title:string; description:string; headline:string; intro:string;
  context:string; guide:string; tip:string; queries:string[]; example:string; indexApproved?:boolean;
};
export const RANGE_PAGES: RangePage[] = [

  {
    slug:'1-7',max:7,indexApproved:false,
    title:'Random Number 1–7 | Seven-Day and Seven-Choice Picker',
    description:'Pick a fair random number from 1 to 7 for weekly activities, seven teams or turn-taking. Use a visible spinner, exclusions and no-repeat draws.',
    headline:'Pick a Number from 1 to 7',
    intro:'Seven equal options, ready for weekly challenges and simple seven-way decisions.',
    context:'Number weekdays 1–7 for a rotating activity, draw from seven discussion topics or fairly choose among seven numbered tasks.',
    guide:'Start with numbers 1 through 7, each with the same chance. Spin to see seven sectors or use Quick Pick for an immediate result. The selected option comes from the actual active pool, even after exclusions.',
    tip:'For a seven-day rotation with no repeats, enable Remove winners and draw up to seven numbers in one batch.',
    queries:['pick a number 1-7','random number 1 to 7'],
    example:'A simple seven-way decision for classroom or weekly routines.'
  },
  {
    slug:'1-15',max:15,indexApproved:false,
    title:'Random Number 1–15 | Fifteen Number Picker',
    description:'Choose a number from 1 to 15 fairly, draw distinct numbers, or exclude unavailable items. Free online 1–15 spinner and quick picker.',
    headline:'Random Number from 1 to 15',
    intro:'Choose fairly among fifteen numbered prompts, people or activities.',
    context:'Useful for small classes of 15, numbered question banks and turn-order selection where manual choices could introduce bias.',
    guide:'All numbers 1–15 are included by default. Use Quick Pick for immediate choices, or Spin Wheel for a visual reveal. Large-option displays may simplify labels but the random draw still includes every eligible number.',
    tip:'For no-repeat assignments across the full group, enable Remove winners and request 15 results. Export the ordered result history when finished.',
    queries:['random number generator 1-15','pick a number 1-15'],
    example:'Fifteen questions, prompts or numbered participants.'
  },
  {
    slug:'1-30',max:30,indexApproved:false,
    title:'Random Number 1–30 | Classroom Roll Call & Wheel',
    description:'Pick a random number 1–30, or mark absent students and run a repeat-free classroom roll call with progress, undo and CSV download.',
    headline:'Pick a Number from 1 to 30',
    intro:'Thirty available numbers for classroom participation, numbered cards and activity draws.',
    context:'Assign participation opportunities in a class of about thirty or select from numbered worksheet problems without favoring a particular person.',
    guide:'Each eligible number from 1 to 30 has equal probability in a fresh independent draw. Exclude absent numbers or enable Remove winners for an allocation with no repeats.',
    tip:'A dense 30-segment wheel can be hard to read; use Quick Pick for the fastest result and read the large winning-number card below the wheel.',
    queries:['random number 1-30','pick a number 1-30'],
    example:'Fair participation draws for thirty numbered slots.'
  },
  {
    slug:'1-200',max:200,indexApproved:false,
    title:'Random Number Generator 1–200 | Large Group Picker',
    description:'Generate random numbers from 1 to 200, exclude any numbers and draw up to 100 results at once with optional no repeats.',
    headline:'Random Number from 1 to 200',
    intro:'A quick and fair 200-number picker for larger numbered lists.',
    context:'Select numbered entries in surveys, choose 1 of 200 practice problems, or assign a set of different positions from a larger pool.',
    guide:'The default selection is uniform across all 200 numbers. Because 200 small labels are unreadable in a circle, wheel mode uses a simplified animation while the winner is picked fairly from the entire range.',
    tip:'Batch draws provide 1–100 results at once. Turn on Remove winners if your workflow requires unique numbered entries.',
    queries:['random number 1-200','number generator 1 to 200'],
    example:'A 200-number pool with practical batch selection.'
  },
  {
    slug:'1-1000',max:1000,indexApproved:false,
    title:'Random Number Generator 1–1000 | Secure Range Picker',
    description:'Choose from 1 to 1000 with browser-secure randomness. Draw multiple numbers, remove repeats or exclude numbers without an account.',
    headline:'Random Number from 1 to 1000',
    intro:'Pick any number between 1 and 1,000 in seconds, with a readable result.',
    context:'Useful for numbered tickets, practice question sets, experiment labels or randomized task order for hundreds of identifiers.',
    guide:'Quick Pick samples all 1,000 numbers, not just those suggested by the simplified visual wheel. You may also draw up to 100 results in one batch and prevent repeats within a round.',
    tip:'Export the draw history as CSV or TXT for later checks. Avoid using an unaudited online randomizer for regulated prizes or sensitive assignments.',
    queries:['random number generator 1-1000','pick a number 1 to 1000'],
    example:'A large pool for tickets, prompts and numbering systems.'
  },
  {
    slug:'1-10000',max:10000,indexApproved:false,
    title:'Random Number Generator 1–10000 | Large Range Picker',
    description:'Generate an unbiased integer from 1 to 10,000 instantly. Exclude numbers, draw multiple results and export CSV or TXT.',
    headline:'Random Number from 1 to 10000',
    intro:'A full 10,000-number pool without a crowded wheel or paid service.',
    context:'Choose a random row identifier, select from a numbered training dataset, or make fair picks in a large set of unique reference numbers.',
    guide:'All ten thousand eligible integer values are included. The draw uses secure browser-generated randomness and rejection sampling, not the 12 visible slices in the simplified animation. Quick Pick is the recommended mode at this range.',
    tip:'If you need to draw 100 unique numbers from 1–10000, enter 100 in How many numbers and enable Remove winners. Export the result history rather than copying it from the abbreviated visible preview.',
    queries:['random number generator 1-10000','pick a number between 1 and 10000'],
    example:'One to ten thousand, instant selection and CSV export.'
  },


  {
    slug:'1-2',max:2,indexApproved:false,title:'Pick a Number 1–2 | Fair Two-Choice Spinner',
    description:'Pick 1 or 2 instantly or spin a balanced two-section wheel. Repeat choices or draw without replacement for free.',
    headline:'Pick a Number from 1 to 2',intro:'Two options, equal chances. Get a clear binary decision now or reveal it with a wheel.',
    context:'Useful for choosing between two numbered activities, alternating between two teams or assigning two tasks. Unlike a Yes/No question, both outputs are numeric.',
    guide:'This preset starts with exactly 1 and 2. In Quick Pick mode one value appears immediately. In Spin Wheel mode two equally sized sectors represent the same fair draw.',
    tip:'Turn on Remove winners to get both numbers once in a two-draw round; leave it off for independent picks.',
    queries:['pick a number 1-2','1 or 2 wheel'],example:'A clear either-or result for two numbered choices.'
  },
  {
    slug:'1-8',max:8,indexApproved:false,title:'Random Number 1–8 | Wheel & Team Station Assignment',
    description:'Spin a fair random number from 1 to 8, or assign up to eight teams to distinct numbered stations. Free instant picker, station list and CSV download.',
    headline:'Random Number from 1 to 8',intro:'Eight numbered outcomes on one wheel, ready for small groups and activity rotations.',
    context:'Assign one of eight stations, choose one of eight numbered cards or allocate turns in a small game without introducing preferences.',
    guide:'Eight equal sectors are visible when the default 1–8 range is active. You can exclude an unavailable number or draw multiple numbers without replacement using Quick Pick.',
    tip:'To assign all eight positions without repeats, choose eight results and enable Remove winners.',
    queries:['random number 1-8','pick a number 1-8'],example:'Eight teams, eight stations or eight numbered challenges.'
  },
  {
    slug:'1-10',max:10,indexApproved:false,title:'Pick a Number 1–10 | Ten-Choice Number Wheel',
    description:'Draw a number between 1 and 10 immediately or spin a colorful fair wheel. Supports exclusions, repeat-free picks and a clear history.',
    headline:'Pick a Number from 1 to 10',intro:'A clean ten-number picker for games, study groups and everyday selection.',
    context:'Use a familiar 1–10 scale to randomly select a quiz prompt, a game position or one of ten numbered suggestions.',
    guide:'Choose Quick Pick for an instant number, or Spin Wheel to visualize ten choices. Each active number has equal probability unless you exclude it.',
    tip:'For an ordered ten-person draw, choose ten results with Remove winners enabled and export them as a CSV list.',
    queries:['pick a number 1-10','random number 1 to 10'],example:'Ten choices, a fast result and an optional wheel.'
  },
  {
    slug:'1-50',max:50,indexApproved:false,title:'Random Number 1–50 | Quick Picker for Groups',
    description:'Generate a number between 1 and 50. Exclude unavailable numbers, make repeat-free batch draws or reveal one result with a simplified wheel.',
    headline:'Random Number from 1 to 50',intro:'Pick from fifty numbers without clutter. Instant result first, animation available when you want it.',
    context:'Suitable for assigning participation numbers across a large class, numbered worksheets or selecting from fifty tickets.',
    guide:'The default quick picker samples all fifty numbers fairly. The animated wheel is a simplified visual display and does not omit candidates or pretend to show fifty readable labels.',
    tip:'Enable Remove winners before drawing multiple numbers when a repeated assignment would cause confusion.',
    queries:['random number generator 1-50','number generator 1-50'],example:'Fifty eligible numbers, without a crowded wheel.'
  },

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
