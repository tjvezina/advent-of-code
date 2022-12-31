import AbstractChallenge, { Answer } from '@app/abstract-challenge';

export default class Challenge extends AbstractChallenge {
  title = 'Tuning Trouble';

  // --- Part 1 --- //
  part1ExpectedAnswer = 1965;
  solvePart1(): [string, Answer] {
    const markerIndex = this.findDistinctSequence(4);

    return ['The first start-of-packet marker ends at character ', markerIndex + 1];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 2773;
  solvePart2(): [string, Answer] {
    const markerIndex = this.findDistinctSequence(14);

    return ['The first start-of-message marker ends at character ', markerIndex + 1];
  }

  findDistinctSequence(length: number): number {
    const chars = [...this.input];

    return chars.findIndex((_, i) => {
      if (i >= (length - 1)) {
        const subset = chars.slice(i - (length - 1), i + 1);
        return subset.length === (new Set(subset)).size;
      }
      return false;
    });
  }
}
