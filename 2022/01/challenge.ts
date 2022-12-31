import AbstractChallenge, { Answer } from '@app/abstract-challenge';

export default class Challenge extends AbstractChallenge {
  title = 'Calorie Counting';

  calorieLists!: number[][];

  init(): void {
    this.calorieLists = [[]];

    this.input.split(/\r?\n/).forEach(line => {
      if (line.length === 0) {
        this.calorieLists.push([]);
      } else {
        this.calorieLists.slice(-1)[0].push(parseInt(line));
      }
    });
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 68923;
  solvePart1(): [string, Answer] {
    const calorieTotals = this.calorieLists.map(list => list.reduce((a, b) => a + b));
    const maxCalories = calorieTotals.reduce((a, b) => a > b ? a : b);

    return ['The highest calorie count is ', maxCalories];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 200044;
  solvePart2(): [string, Answer] {
    const calorieTotals = this.calorieLists.map(list => list.reduce((a, b) => a + b));
    const topThreeSum = calorieTotals.sort((a, b) => a - b).slice(-3).reduce((a, b) => a + b);

    return ['The total calories carried by the top 3 elves is ', topThreeSum];
  }
}
