const DIGIT_MAP = {
  'abcefg': '0',
  'cf': '1',
  'acdeg': '2',
  'acdfg': '3',
  'bcdf': '4',
  'abdfg': '5',
  'abdefg': '6',
  'acf': '7',
  'abcdefg': '8',
  'abcdfg': '9',
};
Object.freeze(DIGIT_MAP);

export const challenge = {
  title: 'Seven Segment Search',

  init() {
    this.signalData = this.input
      .split(/\r?\n/)
      .map(str => {
        const parts = str.match(/([a-g]+)/g);
        return {
          patterns: parts.slice(0, 10).sort((a, b) => a.length - b.length),
          display: parts.slice(10),
        }
      });
  },

  // --- Part 1 --- //
  part1ExpectedAnswer: 519,
  solvePart1() {
    const uniquePatterns = this.signalData
      .map(data => data.display)
      .flatMap(display => display.filter(digit => [2, 3, 4, 7].includes(digit.length)));

    return ['Digits with unique segment counts: ', uniquePatterns.length];
  },

  // --- Part 2 --- //
  part2ExpectedAnswer: 1027483,
  solvePart2() {
    return ['The sum of all displayed values is ', this.signalData.map(this.decipherSignal).reduce((a, b) => a + b)];
  },

  decipherSignal({ patterns, display }) {
    // Patterns were sorted by length in init
    const [one, seven, four] = patterns;
    const sixSegDigits = patterns.slice(6, 9);
    const eight = patterns.slice(-1)[0];

    const segmentMap = {};

    // Segment A is in seven, but not one
    segmentMap.a = [...seven].filter(x => !one.includes(x))[0];

    // Segments C and F are in one...
    const cf = [...one];
    // ...F is in every six-segment digit, and C is not
    segmentMap.f = cf.filter(x => sixSegDigits.every(digit => digit.includes(x)))[0];
    segmentMap.c = cf.filter(x => x !== segmentMap.f)[0];

    // Segments B and D are in four, but not one...
    const bd = [...four].filter(x => !one.includes(x));
    // ...B is in every six-segment digit, and D is not
    segmentMap.b = bd.filter(x => sixSegDigits.every(digit => digit.includes(x)))[0];
    segmentMap.d = bd.filter(x => x !== segmentMap.b)[0];

    // Segments E and G are the only remaining segments...
    const eg = [...eight].filter(x => !Object.values(segmentMap).includes(x));
    // ...G is in every six-segment digit, and E is not
    segmentMap.g = eg.filter(x => sixSegDigits.every(digit => digit.includes(x)))[0];
    segmentMap.e = eg.filter(x => x !== segmentMap.g)[0];

    // Reverse map to go from scrambled to original
    const correctionMap = Object.keys(segmentMap).reduce((acc, key) => {
      acc[segmentMap[key]] = key;
      return acc;
    }, {});

    const digits = display.map(digit => {
      const correctedSegments = [...digit].map(seg => correctionMap[seg]).sort().join('')
      return DIGIT_MAP[correctedSegments];
    });

    return Number(digits.join(''));
  }
}