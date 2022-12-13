const DEBUG = false;

const INVALID = -1;
const INCONCLUSIVE = 0;
const VALID = 1;

export const challenge = {
  title: 'Distress Signal',

  init() {
    const lines = this.input.split(/\r?\n/);

    this.packetPairs = [];

    for (let i = 0; i < lines.length; i += 3) {
      this.packetPairs.push(lines.slice(i, i + 2).map(line => JSON.parse(line)));
    }
  },

  // --- Part 1 --- //
  part1ExpectedAnswer: 6070,
  solvePart1() {
    let validIndexSum = 0;
    for (let i = 0; i < this.packetPairs.length; i++) {
      if (DEBUG) console.log(`Pair ${i}`);
      const state = comparePackets(...this.packetPairs[i]);

      if (state === INCONCLUSIVE) {
        throw new Error(`Failed to determine whether pair ${i} is valid`);
      }

      if (state === VALID) {
        validIndexSum += (i + 1);
      }
    }

    return ['The sum of the valid packet indicies is ', validIndexSum];
  },

  // --- Part 2 --- //
  part2ExpectedAnswer: 20758,
  solvePart2() {
    const dividerA = [[2]];
    const dividerB = [[6]];

    const packets = [...this.packetPairs.flatMap(x => x), dividerA, dividerB].sort((a, b) => -comparePackets(a, b));

    const indexA = packets.indexOf(dividerA) + 1;
    const indexB = packets.indexOf(dividerB) + 1;

    return [`The dividers are at ${indexA} and ${indexB}, thus the decoder key is `, indexA * indexB];
  },
}

function comparePackets(a, b, d = 0) {
  for (let i = 0; true; i++) {
    let x = a[i];
    let y = b[i];

    if (x === undefined && y === undefined) {
      if (DEBUG) console.log(' '.repeat(d) + '- Lists are same length: INCONCLUSIVE');
      return INCONCLUSIVE;
    }
    if (x === undefined) {
      if (DEBUG) console.log(' '.repeat(d) + '- Left ran out of items first: VALID');
      return VALID;
    }
    if (y === undefined) {
      if (DEBUG) console.log(' '.repeat(d) + '- Right ran out of items first: INVALID');
      return INVALID;
    }

    const xIsArray = Array.isArray(x);
    const yIsArray = Array.isArray(y);

    if (!xIsArray && !yIsArray) {
      if (x !== y) {
        if (DEBUG) console.log(' '.repeat(d) + `- ${x < y ? `${x} < ${y}: VALID` : `${x} > ${y}: INVALID`}`);
        return (x < y ? VALID : INVALID);
      }
      if (DEBUG) console.log(' '.repeat(d) + `- ${x} = ${y}: INCONCLUSIVE`);
      continue;
    }
    
    if (!xIsArray) {
      if (DEBUG) console.log(' '.repeat(d) + `- Convert ${x} to [${x}]`);
      x = [x];
    }
    if (!yIsArray) {
      if (DEBUG) console.log(' '.repeat(d) + `- Convert ${y} to [${y}]`);
      y = [y];
    }

    if (DEBUG) console.log(' '.repeat(d) + '- Comparing arrays...');
    const result = comparePackets(x, y, d+1);

    if (result !== INCONCLUSIVE) {
      return result;
    }
  }
}