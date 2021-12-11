const LineStatus = {
  Valid: 0,
  SyntaxError: 1,
  Incomplete: 2,
}

const chunkMap = {
  '(': ')',
  '[': ']',
  '{': '}',
  '<': '>',
};
Object.freeze(chunkMap);

const part1PointMap = {
  ')': 3,
  ']': 57,
  '}': 1197,
  '>': 25137,
};
Object.freeze(part1PointMap);

const part2PointMap = {
  ')': 1,
  ']': 2,
  '}': 3,
  '>': 4,
};
Object.freeze(part2PointMap);

export const challenge = {
  title: 'Syntax Scoring',

  init() {
    this.lines = this.input.split(/\r?\n/);
  },

  // --- Part 1 --- //
  part1ExpectedAnswer: 319233,
  solvePart1() {
    this.results = this.lines.map(this.checkLine);

    const errors = this.results.filter(result => result.status === LineStatus.SyntaxError);

    const scores = errors.map(result => part1PointMap[result.found]);

    return ['The total syntax error score is ', scores.reduce((a, b) => a + b)];
  },

  // --- Part 2 --- //
  part2ExpectedAnswer: 1118976874,
  solvePart2() {
    const missingChars = this.results.filter(result => result.status == LineStatus.Incomplete).map(result => result.missing);

    const scores = missingChars.map(missing => missing.reduce((a, b) => a * 5 + part2PointMap[b], 0));

    return ['The median incomplete line score is ', scores.sort((a, b) => a - b)[(scores.length - 1) / 2]];
  },

  checkLine(line) {
    const chunkStack = [];

    const openChars = Object.keys(chunkMap);

    for (const char of [...line]) {
      if (openChars.includes(char)) {
        chunkStack.push(char);
      } else {
        const lastOpen = chunkStack.pop();
        if (char !== chunkMap[lastOpen]) {
          return { status: LineStatus.SyntaxError, expected: chunkMap[lastOpen], found: char };
        }
      }
    }

    if (chunkStack.length > 0) {
      return { status: LineStatus.Incomplete, missing: chunkStack.map(c => chunkMap[c]).reverse() };
    }

    return { status: LineStatus.Valid };
  },
}