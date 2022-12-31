import AbstractChallenge, { Answer } from '@app/abstract-challenge';

const PART_1_DAYS = 80;
const PART_2_DAYS = 256;

export default class Challenge extends AbstractChallenge {
  title = 'Lanternfish';

  initialTimers!: number[];

  init(): void {
    this.initialTimers = this.input.split(',').map(x => parseInt(x));
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 379114;
  solvePart1(): [string, Answer] {
    const totalFish = this.simulate(PART_1_DAYS);

    return [`After ${PART_1_DAYS} days, there are {0} lanternfish`, totalFish];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 1702631502303;
  solvePart2(): [string, Answer] {
    const totalFish = this.simulate(PART_2_DAYS);

    return [`After ${PART_2_DAYS} days, there are {0} lanternfish`, totalFish];
  }

  simulate(days: number): number {
    const timerCounts = new Array(9).fill(0);
    this.initialTimers.forEach(timer => timerCounts[timer]++);

    for (let i = 0; i < days; i++) {
      const zeros = timerCounts.shift();
      timerCounts.push(zeros);
      timerCounts[6] += zeros;
    }

    return timerCounts.reduce((a, b) => a + b);
  }
}
