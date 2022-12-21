const ROOT = 'root';
const HUMN = 'humn';

export const challenge = {
  title: 'Monkey Math',

  init() {
    this.monkeys = new Map(this.input.split(/\r?\n/).map(line => {
      const [name, job] = line.split(': ');

      if (/\d+/.test(job)) {
        return [name, parseInt(job)];
      } else {
        const [operandA, operator, operandB] = job.match(/(\w{4}) ([+\-*/]) (\w{4})/).slice(1, 4);
        return [name, { operandA, operandB, operator }];
      }
    }));
  },

  // --- Part 1 --- //
  part1ExpectedAnswer: 299983725663456,
  solvePart1() {
    return [`The monkey named "${ROOT}" will yell `, this.getValue(ROOT)];
  },

  // --- Part 2 --- //
  part2ExpectedAnswer: 3093175982595,
  solvePart2() {
    // Determine which monkeys depend on 'humn'
    const doesDependOnHumn = (name) => {
      const job = this.monkeys.get(name);

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
    }

    if (!doesDependOnHumn(ROOT)) throw new Error(`${ROOT} does not depend on ${HUMN}, unable to solve!`);

    const root = this.monkeys.get(ROOT);
    const humn = this.monkeys.get(HUMN);
    
    // Solve the non-humn half first
    let value = this.getValue(root.humnOperand === 'a' ? root.operandB : root.operandA);
    let monkey = this.monkeys.get(root.humnOperand === 'a' ? root.operandA : root.operandB);

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

      monkey = this.monkeys.get(monkey.humnOperand === 'a' ? monkey.operandA : monkey.operandB);
    }

    return ['The number you must yell out is ', value];
  },

  getValue(name) {
    const job = this.monkeys.get(name);

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
    }
  },
}