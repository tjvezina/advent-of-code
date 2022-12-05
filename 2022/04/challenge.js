export const challenge = {
  title: 'Camp Cleanup',

  init() {
    this.inputLines = this.input.split(/\r?\n/);
  },

  // --- Part 1 --- //
  part1ExpectedAnswer: 456,
  solvePart1() {
    this.pairs = this.inputLines.map(line => {
      const [minA, maxA, minB, maxB] = line.match(/(\d+)-(\d+),(\d+)-(\d+)/).slice(1, 5).map(x => parseInt(x));

      return [
        { min: minA, max: maxA },
        { min: minB, max: maxB },
      ];
    });

    const fullyOverlappingPairs = this.pairs.filter(pair => {
      const [a, b] = pair;
      return (a.min >= b.min && a.max <= b.max) || (a.min <= b.min && a.max >= b.max);
    });

    return ['There are {0} fully overlapping pairs.', fullyOverlappingPairs.length];
  },

  // --- Part 2 --- //
  part2ExpectedAnswer: 808,
  solvePart2() {
    const overlappingPairs = this.pairs.filter(pair => {
      const [a, b] = pair;
      return (a.min <= b.max && a.max >= b.min);
    });

    return ['There are {0} overlapping pairs.', overlappingPairs.length];
  },
}