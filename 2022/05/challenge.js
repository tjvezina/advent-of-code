export const challenge = {
  title: 'Supply Stacks',

  init() {
    const inputLines = this.input.split(/\r?\n/);

    const crateRows = [];

    let lineIndex = 0;
    while (!inputLines[lineIndex].startsWith(' 1 ')) {
      const line = inputLines[lineIndex];
      const row = [];
      for (let i = 1; i < line.length; i += 4) {
        row.push(line[i]);
      }
      crateRows.push(row);
      lineIndex++;
    }

    const stackCount = Math.ceil(inputLines[lineIndex].length / 4);

    this.stacks = new Array(stackCount).fill().map((_, i) => {
      return crateRows.map(row => row[i]).filter(crate => crate !== ' ');
    })

    lineIndex += 2;

    this.instructions = [];
    while (lineIndex < inputLines.length) {
      const line = inputLines[lineIndex];

      const [count, source, destination] = line.match(/move (\d+) from (\d+) to (\d+)/).slice(1, 4).map(x => parseInt(x));

      this.instructions.push({ count, source, destination });

      lineIndex++;
    }
  },

  // --- Part 1 --- //
  part1ExpectedAnswer: 'RNZLFZSJH',
  solvePart1() {
    const modifiedStacks = this.stacks.map(stack => [...stack]);

    this.instructions.forEach(instruction => {
      for (let i = 0; i < instruction.count; i++) {
        modifiedStacks[instruction.destination - 1].unshift(modifiedStacks[instruction.source - 1].shift());
      }
    });

    const topCrates = modifiedStacks.map(stack => stack[0]).reduce((a, b) => a + b);

    return ['The top crates when using a CrateMover 9000 are ', topCrates];
  },

  // --- Part 2 --- //
  part2ExpectedAnswer: 'CNSFCGJSM',
  solvePart2() {
    const modifiedStacks = this.stacks.map(stack => [...stack]);

    this.instructions.forEach(instruction => {
      modifiedStacks[instruction.destination - 1].splice(0, 0, ...modifiedStacks[instruction.source - 1].splice(0, instruction.count));
    })

    const topCrates = modifiedStacks.map(stack => stack[0]).reduce((a, b) => a + b);

    return ['The top crates when using a CrateMover 9001 are ', topCrates];
  },
}