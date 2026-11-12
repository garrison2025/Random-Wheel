
/**
 * Uniform selection using rejection sampling. Every admissible uint32 value
 * contributes equally; values in the partial trailing bucket are rejected.
 * No Math.random fallback: a missing Web Crypto implementation is a hard error.
 */
export type RandomSource = (buffer: Uint32Array) => Uint32Array;
export const cryptoSource: RandomSource = (buffer) => {
  if (typeof crypto === 'undefined' || !crypto.getRandomValues) throw new Error('Secure randomness is unavailable in this browser.');
  return crypto.getRandomValues(buffer);
};

export function secureIndex(count: number, source: RandomSource = cryptoSource): number {
  if (!Number.isSafeInteger(count) || count < 1 || count > 0x100000000) throw new RangeError('Invalid candidate count.');
  const universe = 0x100000000;
  const ceiling = Math.floor(universe / count) * count;
  let value: number;
  do {
    value = source(new Uint32Array(1))[0]!;
    if (!Number.isInteger(value) || value < 0 || value >= universe) throw new Error('Invalid random source.');
  } while (value >= ceiling);
  return value % count;
}

export function weightedIndex(weights: readonly number[], source: RandomSource = cryptoSource): number {
  if (!weights.length || weights.length > 10000) throw new RangeError('Invalid number of weights.');
  let total = 0;
  for (const weight of weights) {
    if (!Number.isSafeInteger(weight) || weight < 0 || weight > 10000) throw new RangeError('Weights must be integers from 0 to 10000.');
    total += weight;
  }
  if (!total || total > 0x100000000) throw new RangeError('Total weight must be greater than zero and fit uint32.');
  const ticket = secureIndex(total, source);
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i]!;
    if (ticket < cumulative) return i;
  }
  throw new Error('Unreachable weighted selection state.');
}

export function numberChoices(min: number, max: number, step = 1, exclusions: readonly number[] = []): number[] {
  if (![min, max, step].every(Number.isSafeInteger) || step < 1 || min > max) throw new RangeError('Enter valid whole numbers with a positive step.');
  // min, max and step may individually be safe integers while max-min and
  // min+i*step overflow Number precision. Compute the sequence exactly.
  const lower=BigInt(min),upper=BigInt(max),increment=BigInt(step);
  const count=(upper-lower)/increment+1n;
  if(count<1n || count>10000n)throw new RangeError('The available range must contain 1–10,000 numbers.');
  const omit=new Set(exclusions);
  return Array.from({length:Number(count)},(_,i)=>{
    const exact=lower+BigInt(i)*increment;
    const value=Number(exact);
    if(!Number.isSafeInteger(value))throw new RangeError('A generated number exceeds the safe integer limit.');
    return value;
  }).filter(value=>!omit.has(value));
}

export function parseExclusions(input: string): number[] {
  if (!input.trim()) return [];
  const parts = input.split(/[\s,;]+/).filter(Boolean);
  if (parts.length > 10000 || parts.some(v => !/^-?\d+$/.test(v) || !Number.isSafeInteger(Number(v)))) throw new RangeError('Exclusions must be whole numbers separated by commas.');
  return parts.map(Number);
}

export type Entry = {label: string; weight: number};
export function parseEntries(input: string): Entry[] {
  const lines = input.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  if (lines.length < 1 || lines.length > 100) throw new RangeError('Add 1–100 wheel entries.');
  return lines.map(line => {
    const parts = line.split(/\s*\|\s*/);
    if (parts.length > 2 || !parts[0] || parts[0].length > 80) throw new Error('Use a short label, optionally followed by | weight.');
    if(parts.length===2 && !/^\d+$/.test(parts[1]||''))throw new Error('An explicit weight must be a whole number from 0 to 10000.');
    const weight = parts.length === 2 ? Number(parts[1]) : 1;
    if (!Number.isSafeInteger(weight) || weight < 0 || weight > 10000) throw new Error('Weights must be whole numbers from 0 to 10000.');
    return {label: parts[0], weight};
  });
}

export function pickEntry(entries: readonly Entry[], source: RandomSource = cryptoSource): number {
  return weightedIndex(entries.map(e => e.weight), source);
}


/** Draw 1–100 independent outcomes, optionally without replacement.
 * The function operates on the active pool; its indices map to that pool.
 * The source is injectable for reproducible testing.
 */
export function drawIndices(entries: readonly Entry[], count: number, withoutReplacement = false, source: RandomSource = cryptoSource): number[] {
  if (!Number.isSafeInteger(count) || count < 1 || count > 100) throw new RangeError('Draw count must be between 1 and 100.');
  const indices = entries.map((e,i)=>i).filter(i=>entries[i]!.weight>0);
  if (!indices.length) throw new Error('No eligible choices.');
  if (withoutReplacement && count>indices.length) throw new RangeError('There are not enough remaining choices for a no-repeat batch.');
  const drawn:number[]=[];
  for(let n=0;n<count;n++){
    const selected=weightedIndex(indices.map(i=>entries[i]!.weight),source);
    drawn.push(indices[selected]!);
    if(withoutReplacement) indices.splice(selected,1);
  }
  return drawn;
}

/** Secure Fisher–Yates shuffle. */
export function shuffleSecure<T>(input:readonly T[],source:RandomSource=cryptoSource):T[] {
  const result=[...input];
  for(let i=result.length-1;i>0;i--){
    const j=secureIndex(i+1,source);
    [result[i],result[j]]=[result[j]!,result[i]!];
  }
  return result;
}
