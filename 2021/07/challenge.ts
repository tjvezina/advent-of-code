import AbstractChallenge, { Answer } from '@app/abstract-challenge';

export default class Challenge extends AbstractChallenge {
  title = 'The Treachery of Whales';

  positions!: number[];

  init(): void {
    this.positions = this.input.split(',').map(x => parseInt(x));
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 347011;
  solvePart1(): [string, Answer] {
    const sortedPositions = [...this.positions].sort((a, b) => a - b);

    const median = (sortedPositions[sortedPositions.length/2 - 1] + sortedPositions[sortedPositions.length/2]) / 2;

    const totalFuel = this.positions.map(pos => Math.abs(pos - median)).reduce((a, b) => a + b);

    return [`The crabs have used {0} fuel after moving to ${median}`, totalFuel];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 98363777;
  solvePart2(): [string, Answer] {
    const mean = this.positions.reduce((a, b) => a + b) / this.positions.length;
    const target = Math.floor(mean); // TODO: Why does flooring the mean give the correct target, instead of rounding it?

    const calculateFuel = function (pos: number): number {
      const steps = Math.abs(pos - target);
      return (steps * (steps + 1)) / 2;
    };

    const totalFuel = this.positions.map(calculateFuel).reduce((a, b) => a + b);

    return [`The crabs have used {0} fuel after moving to ${target}`, totalFuel];
  }
}
