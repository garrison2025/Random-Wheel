export type TaskInfo={
  title:string;steps:string[];scenario:string;reviewNote:string;faq:{question:string;answer:string}[]
};
export const NUMBER_TASK_INFO:Record<number,TaskInfo>={
  2:{
    title:'Map two possible outcomes to real choices',
    steps:['Label number 1 with your first option and number 2 with your second.','Choose Decide fairly. The tool samples exactly one of the two choices, each with a 50% probability.','Download the CSV record if you need to document which option was picked.'],
    scenario:'For example, enter “Team blue presents” and “Team green presents”. The output is a number paired with the exact label you supplied, so nobody has to remember an unstated mapping.',
    reviewNote:'This task is different from a generic Yes/No spinner: the wheel selects a numbered option, and both labels are editable.',
    faq:[{question:'Is option 1 favored?',answer:'No. The two numbers are each sampled with probability 1/2 on every independent draw.'}]
  },
  8:{
    title:'Assign eight teams to stations',
    steps:['Write one team name on each line, up to eight distinct teams.','Choose Assign stations. The task shuffles numbers 1 through 8 with secure randomness.','Review each team-to-station pairing and export the complete CSV.'],
    scenario:'A class with Team A through Team H can assign science stations 1 through 8 at the start of an activity. Each station is used at most once; you can omit absent teams.',
    reviewNote:'Station allocation uses a secure shuffle without repeats rather than picking eight independent numbers that might collide.',
    faq:[{question:'What happens if fewer than eight teams are listed?',answer:'The listed teams are assigned unique numbers from 1–8. Remaining stations are left unassigned.'}]
  },
  10:{
    title:'Instant pick or an ordered set of ten',
    steps:['Press Pick instantly for a single value in 1–10.','Or choose Shuffle 1–10 order to generate every number exactly once.','Use the displayed ordering for a quiz sequence or download it for your group.'],
    scenario:'Choose one of ten numbered classroom quiz questions, or shuffle a ten-step practice circuit while keeping every position once.',
    reviewNote:'The instant button serves answer-first intent; the full-order button solves a different task from the regular spinning interface.',
    faq:[{question:'Can the full order repeat a number?',answer:'No. The 10-number order is a shuffle of 1 through 10, so each appears exactly once.'}]
  },
  15:{
    title:'Generate a fair presentation order for up to fifteen people',
    steps:['Replace the sample student names with your class or team list (1–15 unique names).','Generate a random call order. Each name appears one time.','Export the numbered call order to CSV, including names and positions.'],
    scenario:'For a 12-person literature circle, paste the participant names and immediately obtain twelve unique presentation positions without manually drawing slips.',
    reviewNote:'The result is a roster assignment workflow with name validation and a downloadable order, not merely “pick number 1–15”.',
    faq:[{question:'What if the same participant name is entered twice?',answer:'The tool asks you to use distinct labels to prevent assigning the same person two positions.'}]
  },
  30:{
    title:'Call students without repeats—and handle absences',
    steps:['Enter absent roll numbers, such as 3, 12 and 27.','Generate a shuffled order for all other numbers in 1–30.','Use Call next student to reveal the next present number; export the complete order when needed.'],
    scenario:'If 3, 12 and 27 are absent, the activity has 27 eligible students. Each Call next action moves to a new, previously unused roll number.',
    reviewNote:'A progressive teacher-oriented call interface prevents repeat calls and reduces the chance of naming an absent student.',
    faq:[{question:'Are absent roll numbers ever drawn?',answer:'No. Valid excluded numbers are removed before the sequence is shuffled.'}]
  },
  1000:{
    title:'Create a reproducible sample record',
    steps:['Choose a batch size between 1 and 100.','Optionally exclude unavailable identifiers and choose whether repeats are permitted.','Sample values, review the unique count and observed minimum/maximum, then export the ordered CSV.'],
    scenario:'For a review task, draw 40 unique numbers from 1–1,000, while excluding identifiers 11 and 99. The CSV preserves the selected order.',
    reviewNote:'This workflow emphasizes batch output, exclusions, distinctness and an exported record rather than pretending 1,000 labels fit on a wheel.',
    faq:[{question:'Is this suitable for certified lotteries?',answer:'No. It is a browser-based everyday sampling tool; regulatory and audited contest requirements may differ.'}]
  }
};
