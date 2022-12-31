import AbstractChallenge, { Answer } from '@app/abstract-challenge';

type Job = number | OperationJob;
type OperationJob = {
  operandA: string,
  operandB: string,
  operator: string,
  humnOperand?: 'a' | 'b',
};

const ROOT = 'root';
const HUMN = 'humn';

export default class Challenge extends AbstractChallenge {
  title = 'Monkey Math';

  monkeys!: Map<string, Job>;

  init(): void {
    this.monkeys = new Map(this.input.split(/\r?\n/).map(line => {
      const [name, job] = line.split(': ');

      if (/\d+/.test(job)) {
        return [name, parseInt(job) as Job];
      } else {
        const [operandA, operator, operandB] = job.match(/(\w{4}) ([+\-*/]) (\w{4})/)!.slice(1, 4);
        return [name, { operandA, operandB, operator } as Job];
      }
    }));
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 299983725663456;
  solvePart1(): [string, Answer] {
    return [`The monkey named "${ROOT}" will yell `, this.getValue(ROOT)];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 3093175982595;
  solvePart2(): [string, Answer] {
    // Determine which monkeys depend on 'humn'
    const doesDependOnHumn = (name: string): boolean => {
      const job = this.monkeys.get(name)!;

      if (typeof job === 'number') {
        return name === HUMN;
      }

      if (doesDependOnHumn(job.operandA)) {
        job.humnOperand = 'a';
        return true;
      }
      if (doesDependOnHumn(job.operandB)) {
        job.humnOperand = 'b';
        return true;
      }

      return false;
    };

    if (!doesDependOnHumn(ROOT)) throw new Error(`${ROOT} does not depend on ${HUMN}, unable to solve!`);

    const root = this.monkeys.get(ROOT) as OperationJob;
    const humn = this.monkeys.get(HUMN)!;

    // Solve the non-humn half first
    let value = this.getValue(root.humnOperand === 'a' ? root.operandB : root.operandA);
    let monkey = this.monkeys.get(root.humnOperand === 'a' ? root.operandA : root.operandB) as OperationJob;

    // Reverse-solve the humn-dependant half
    while (monkey !== humn) {
      if (monkey.humnOperand === 'a') {
        const b = this.getValue(monkey.operandB);

        switch (monkey.operator) {
          case '+': value -= b; break;
          case '-': value += b; break;
          case '*': value /= b; break;
          case '/': value *= b; break;
        }
      } else {
        const a = this.getValue(monkey.operandA);

        switch (monkey.operator) {
          case '+': value = value - a; break;
          case '-': value = a - value; break;
          case '*': value = value / a; break;
          case '/': value = a / value; break;
        }
      }

      monkey = this.monkeys.get(monkey.humnOperand === 'a' ? monkey.operandA : monkey.operandB) as OperationJob;
    }

    return ['The number you must yell out is ', value];
  }

  getValue(name: string): number {
    const job = this.monkeys.get(name)!;

    if (typeof job === 'number') {
      return job;
    }

    const a = this.getValue(job.operandA);
    const b = this.getValue(job.operandB);

    switch (job.operator) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return a / b;
      default:
        throw new Error('Unknown operator: ' + job.operator);
    }
  }
}
