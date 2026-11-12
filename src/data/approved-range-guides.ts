/**
 * Six editorially reviewed, intent-specific examples for approved range pages.
 * Only describe actions the existing number workbench actually supports.
 * No new pages or indexing permissions are created by this data.
 */
export type ApprovedRange = 3|4|5|6|20|100;
export interface RangeWorkflow {
  title: string;
  preset: {batch:number;remove:boolean;exclude?:string;mode:'quick'|'spin'};
  purpose: string;
  steps: string[];
  outcome: string;
}
export interface RangeGuide {
  heading: string;
  intro: string;
  examples: [RangeWorkflow, RangeWorkflow];
  distinction: string;
}
export const APPROVED_RANGE_GUIDES: Record<ApprovedRange,RangeGuide> = {
  3: {
    heading:'Three-way decisions and fair first turns',
    intro:'The wheel opens with exactly 1, 2 and 3. Choose once for a quick answer, or distribute all three numbered positions across a group.',
    examples:[
      {
        title:'Choose one of three activities',
        preset:{batch:1,remove:false,mode:'quick'},
        purpose:'Assign 1 = reading, 2 = a puzzle, and 3 = a drawing break before the draw.',
        steps:['Leave From at 1, To at 3, and Step at 1.','Keep Remove winners off so the next choice is independent.','Use Quick Pick to display 1, 2 or 3 instantly.'],
        outcome:'With all three active, each number has a 1-in-3 chance on every independent draw.'
      },
      {
        title:'Give three people unique turn numbers',
        preset:{batch:3,remove:true,mode:'quick'},
        purpose:'You need all three positions, but no position should be assigned twice.',
        steps:['Keep the default 1–3 pool.','Switch on Remove winners.','Set the “How many numbers?” field to 3, then draw once.'],
        outcome:'The three results contain 1, 2 and 3 in a random order; export the history if needed.'
      }
    ],
    distinction:'This preset chooses numbered outcomes, not names. If you need to draw from three names instead, use the custom name wheel on the home page.'
  },
  4: {
    heading:'Four-corner games and station selection',
    intro:'Four numbered sectors make it easy to agree on four corners, teams or activity stations before anyone draws.',
    examples:[
      {
        title:'Choose a classroom corner',
        preset:{batch:1,remove:false,mode:'spin'},
        purpose:'Mark the four room corners 1–4, then ask each participant to draw a destination.',
        steps:['Start with From 1 and To 4; all four corners are available.','Use Spin Wheel for a visible four-sector reveal.','Keep repeats allowed if more than four participants may visit the same corner.'],
        outcome:'Every corner is equally likely while all four remain eligible.'
      },
      {
        title:'Assign four different station slots',
        preset:{batch:4,remove:true,mode:'quick'},
        purpose:'Four groups need four distinct positions without a repeated number.',
        steps:['Keep Step at 1 and leave the exclusion field blank.','Enable Remove winners.','Set the “How many numbers?” field to 4 for one random ordering.'],
        outcome:'The result lists all four slots once. To repeat the activity, start a new round.'
      }
    ],
    distinction:'Excluding corner 4 does not redistribute the label of the remaining corners; it simply leaves 1, 2 and 3 as the active outcomes.'
  },
  5: {
    heading:'Five-option games, task picks and rotations',
    intro:'Use this preset when the five choices already have numbers, such as five warm-up exercises or five group tasks.',
    examples:[
      {
        title:'Choose the next warm-up task',
        preset:{batch:1,remove:false,mode:'quick'},
        purpose:'Number five short activities in advance and let the class pick one.',
        steps:['Confirm the active range is 1–5.','Leave Remove winners off if an activity can be selected again.','Choose Quick Pick for a result without waiting for a spin.'],
        outcome:'Every draw uses the same five-number pool unless you change the settings.'
      },
      {
        title:'Create an order for five activities',
        preset:{batch:5,remove:true,mode:'quick'},
        purpose:'Visit all five stations in an unpredictable order without revisiting one.',
        steps:['Turn on Remove winners before the first draw.','Set the “How many numbers?” field to 5.','Draw the batch and save the ordered results from the history.'],
        outcome:'The five numbers appear once each; the sequence is random, not sorted.'
      }
    ],
    distinction:'Use one result when you want a decision; use a five-result no-repeat batch when you need an entire order. They are different tasks.'
  },
  6: {
    heading:'A six-sided die or a six-person draw?',
    intro:'Both activities use the numbers 1–6, but they need different repeat settings. Choose the rule before drawing.',
    examples:[
      {
        title:'Simulate independent six-sided die rolls',
        preset:{batch:1,remove:false,mode:'quick'},
        purpose:'Use six equally likely numbers for a tabletop or classroom game.',
        steps:['Keep From 1, To 6 and Step 1.','Leave Remove winners turned off.','Choose Quick Pick each time, or switch to Spin Wheel for a visual reveal.'],
        outcome:'A 6 can follow another 6: independent die-style rolls allow repeats.'
      },
      {
        title:'Draw six distinct turn positions',
        preset:{batch:6,remove:true,mode:'quick'},
        purpose:'Assign each position from 1 through 6 once.',
        steps:['Enable Remove winners.','Set the “How many numbers?” field to 6.','Generate the batch; use the displayed order as the assignment list.'],
        outcome:'Every position appears once. This is a shuffle, not a sequence of independent die rolls.'
      }
    ],
    distinction:'The optional spinning animation does not turn the browser into a physically simulated die; the number is selected by the same secure random-number method.'
  },
  20: {
    heading:'A roll call for twenty numbered students',
    intro:'This wheel can choose a student number without exposing a list of names. Handle absences before drawing.',
    examples:[
      {
        title:'Call one present student',
        preset:{batch:1,remove:false,exclude:'4, 7, 12',mode:'quick'},
        purpose:'Suppose student numbers 4, 7 and 12 are absent today.',
        steps:['Keep the default 1–20 range.','Enter 4, 7, 12 in the Exclusions field.','Choose Quick Pick to call one of the remaining 17 numbers.'],
        outcome:'Absent numbers will not be drawn while those exclusions remain active.'
      },
      {
        title:'Give every present student one turn',
        preset:{batch:17,remove:true,exclude:'4, 7, 12',mode:'quick'},
        purpose:'With those same three students absent, make a no-repeat sequence for the other seventeen.',
        steps:['Enter 4, 7, 12 as exclusions.','Enable Remove winners.','Set the “How many numbers?” field to 17 and generate the batch.'],
        outcome:'The result contains seventeen unique present numbers. Export the history if you need a record.'
      }
    ],
    distinction:'The number wheel is not a student attendance database. Exclusions are local settings and may need updating each session.'
  },
  100: {
    heading:'Instant 1–100 picks and unique number samples',
    intro:'When there are one hundred possibilities, the fastest workflow is a direct result. You can still animate the draw if you want a visual reveal.',
    examples:[
      {
        title:'Get a single random number from 1 to 100',
        preset:{batch:1,remove:false,mode:'quick'},
        purpose:'Pick a numbered question, a practice item, or a ticket reference.',
        steps:['Keep From 1, To 100 and Step 1.','Choose Quick Pick for an immediate result.','Leave Remove winners off if you want independent future picks.'],
        outcome:'All one hundred numbers are eligible. The simplified large-range wheel does not reduce the draw to only the sectors on screen.'
      },
      {
        title:'Sample 10 different numbers out of 100',
        preset:{batch:10,remove:true,mode:'quick'},
        purpose:'Create a small, non-repeating set from a larger numbered list.',
        steps:['Enable Remove winners.','Set the “How many numbers?” field to 10.','Generate the batch, then export the result history if needed.'],
        outcome:'Ten different numbers are selected; the remaining ninety stay available for later draws in the same round.'
      }
    ],
    distinction:'This is a general-purpose number picker, not a certified raffle or lottery service. Do not rely on it where regulated or independently audited drawings are required.'
  }
};

export const APPROVED_GUIDE_RANGES = [3,4,5,6,20,100] as const;
