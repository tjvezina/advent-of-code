import AbstractChallenge, { Answer } from '@app/abstract-challenge';

export default class Challenge extends AbstractChallenge {
  title = 'Rucksack Reorganization';

  inputLines!: string[];

  init(): void {
    this.inputLines = this.input.split(/\r?\n/);
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 7766;
  solvePart1(): [string, Answer] {
    const rucksacks = this.inputLines.map(line => {
      const componentLength = line.length / 2;
      if (!Number.isInteger(componentLength)) throw new Error(`Invalid rucksack contents, odd number of items (${line.length})`);

      return [[...line.substring(0, componentLength)], [...line.substring(componentLength)]];
    });

    const commonItems = rucksacks.map(rucksack => rucksack[0].find(item => rucksack[1].includes(item)) as string);

    const commonItemPriorities = commonItems.map(getItemPriority);

    const commonItemPrioritySum = commonItemPriorities.reduce((a, b) => a + b);

    return ['The sum of the priorities of all common items is ', commonItemPrioritySum];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 2415;
  solvePart2(): [string, Answer] {
    const groups = [];
    for (let i = 0; i < this.inputLines.length; i += 3) {
      groups.push(this.inputLines.slice(i, i + 3).map(line => [...line]));
    }

    const badgeItems = groups.map(group => group[0].find(item => group[1].includes(item) && group[2].includes(item)) as string);

    const badgePriorities = badgeItems.map(getItemPriority);

    const badgePrioritySum = badgePriorities.reduce((a, b) => a + b);

    return ['The sum of the priorities of all badge items is ', badgePrioritySum];
  }
}

function getItemPriority(item: string): number {
  if (item === item.toLowerCase()) {
    return item.charCodeAt(0) - 'a'.charCodeAt(0) + 1;
  } else {
    return item.charCodeAt(0) - 'A'.charCodeAt(0) + 27;
  }
}
