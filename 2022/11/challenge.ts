import AbstractChallenge, { Answer } from '@app/abstract-challenge';

type Monkey = {
  startingItems: number[],
  items: number[],
  inspectionCount: number,
  testDivisor: number,
  testPassTarget: number,
  testFailTarget: number,
  operation: (x: number) => number,
};

export default class Challenge extends AbstractChallenge {
  title = 'Monkey in the Middle';

  monkeys: Monkey[] = [];

  init(): void {
    const lines = this.input.split(/\r?\n/);

    for (let i = 0; i < lines.length; i += 7) {
      const startingItems = [...lines[i+1].matchAll(/\d+/g)].map(match => parseInt(match[0]));
      const [operator, operand] = lines[i+2].match(/new = old (\*|\+) (.*)/)!.slice(1, 3);
      const testDivisor = parseInt(lines[i+3].match(/divisible by (\d+)/)?.[1] as string);
      const testPassTarget = parseInt(lines[i+4].match(/throw to monkey (\d+)/)![1]);
      const testFailTarget = parseInt(lines[i+5].match(/throw to monkey (\d+)/)![1]);

      this.monkeys.push({
        startingItems,
        items: [...startingItems],
        inspectionCount: 0,
        testDivisor,
        testPassTarget,
        testFailTarget,
        operation: (operator === '+'
          ? (operand === 'old' ? (x: number): number => x + x : (x: number): number => x + parseInt(operand))
          : (operand === 'old' ? (x: number): number => x * x : (x: number): number => x * parseInt(operand))
        ),
      });
    }
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 120384;
  solvePart1(): [string, Answer] {
    for (let iRound = 0; iRound < 20; iRound++) {
      this.monkeys.forEach(monkey => {
        while (monkey.items.length > 0) {
          let item = monkey.items.shift() as number;

          // Inspection
          item = monkey.operation(item);
          monkey.inspectionCount++;

          // Relief
          item = Math.floor(item / 3);

          // Throw
          if (item % monkey.testDivisor === 0) {
            this.monkeys[monkey.testPassTarget].items.push(item);
          } else {
            this.monkeys[monkey.testFailTarget].items.push(item);
          }
        }
      });
    }

    const monkeyBusiness = this.monkeys.map(monkey => monkey.inspectionCount).sort((a, b) => b - a).slice(0, 2).reduce((a, b) => a * b);

    return ['The level of monkey business after 20 rounds is ', monkeyBusiness];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 32059801242;
  solvePart2(): [string, Answer] {
    this.monkeys.forEach(monkey => {
      monkey.items = [...monkey.startingItems];
      monkey.inspectionCount = 0;
    });

    const commonDivisor = this.monkeys.map(monkey => monkey.testDivisor).reduce((a, b) => a * b);

    for (let iRound = 0; iRound < 10000; iRound++) {
      this.monkeys.forEach(monkey => {
        while (monkey.items.length > 0) {
          let item = monkey.items.shift() as number;

          // Inspection
          item = monkey.operation(item);
          monkey.inspectionCount++;

          // Simplification
          item %= commonDivisor;

          // Throw
          if (item % monkey.testDivisor === 0) {
            this.monkeys[monkey.testPassTarget].items.push(item);
          } else {
            this.monkeys[monkey.testFailTarget].items.push(item);
          }
        }
      });
    }

    const monkeyBusiness = this.monkeys.map(monkey => monkey.inspectionCount).sort((a, b) => b - a).slice(0, 2).reduce((a, b) => a * b);

    return ['The level of monkey business after 10000 rounds is ', monkeyBusiness];
  }
}
