import AbstractChallenge, { Answer } from '@app/abstract-challenge';

export default class Challenge extends AbstractChallenge {
  title = 'Sonar Sweep';

  numbers!: number[];

  init(): void {
    this.numbers = this.input.split(/\r?\n/).map(x => parseInt(x));
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 1462;
  solvePart1(): [string, Answer] {
    const { numbers } = this;

    let increases = 0;
    for (let i = 0; i < numbers.length - 1; i++) {
      if (numbers[i] < numbers[i+1]) {
        increases++;
      }
    }
    return ['The depth readings increase {0} times', increases];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 1497;
  solvePart2(): [string, Answer] {
    const { numbers } = this;

    let sum = numbers.slice(0, 3).reduce((acc, x) => acc + x, 0);

    let increases = 0;
    for (let i = 3; i < numbers.length; i++) {
      const lastSum = sum;
      sum += numbers[i] - numbers[i-3];
      if (lastSum < sum) {
        increases++;
      }
    }

    return ['The depth windows increase {0} times', increases];
  }
}
