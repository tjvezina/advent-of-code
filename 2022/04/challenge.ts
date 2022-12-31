import AbstractChallenge, { Answer } from '@app/abstract-challenge';

export default class Challenge extends AbstractChallenge {
  title = 'Camp Cleanup';

  pairs!: { min: number, max: number }[][];

  init(): void {
    this.pairs = this.input.split(/\r?\n/).map(line => {
      const [minA, maxA, minB, maxB] = line.match(/(\d+)-(\d+),(\d+)-(\d+)/)!.slice(1, 5).map(x => parseInt(x));

      return [
        { min: minA, max: maxA },
        { min: minB, max: maxB },
      ];
    });
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 456;
  solvePart1(): [string, Answer] {
    const fullyOverlappingPairs = this.pairs.filter(pair => {
      const [a, b] = pair;
      return (a.min >= b.min && a.max <= b.max) || (a.min <= b.min && a.max >= b.max);
    });

    return ['There are {0} fully overlapping pairs.', fullyOverlappingPairs.length];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 808;
  solvePart2(): [string, Answer] {
    const overlappingPairs = this.pairs.filter(pair => {
      const [a, b] = pair;
      return (a.min <= b.max && a.max >= b.min);
    });

    return ['There are {0} overlapping pairs.', overlappingPairs.length];
  }
}
