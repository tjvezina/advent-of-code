import AbstractChallenge, { Answer } from '@app/abstract-challenge';

export default class Challenge extends AbstractChallenge {
  title = 'Mirage Maintenance';

  historyList!: number[][];

  init(): void {
    const lines = this.input.split(/\r?\n/);
    this.historyList = lines.map(line => line.split(' ').map(num => parseInt(num)));
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 1884768153;
  solvePart1(): [string, Answer] {
    const nextNumbers = this.historyList.map(this.getNextNumber.bind(this));

    const nextNumberSum = nextNumbers.reduce((a, b) => a + b);
    return ['The sum of the next numbers of each sequence is ', nextNumberSum];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 1031;
  solvePart2(): [string, Answer] {
    const prevNumbers = this.historyList.map(this.getPreviousNumber.bind(this));

    const prevNumberSum = prevNumbers.reduce((a, b) => a + b);
    return ['The sum of the previous numbers of each sequence is ', prevNumberSum];
  }

  getNextNumber(history: number[]): number {
    const sequences: number[][] = [[...history]];

    let lastSequence = sequences.at(-1)!;
    while (lastSequence.some(x => x !== 0)) {
      const nextSequence: number[] = [];
      for (let i = 0; i < lastSequence.length - 1; i++) {
        nextSequence.push(lastSequence[i + 1] - lastSequence[i]);
      }
      sequences.push(nextSequence);
      lastSequence = nextSequence;
    }

    lastSequence.push(0);
    for (let i = sequences.length - 2; i >= 0; i--) {
      sequences[i].push(sequences[i].at(-1)! + sequences[i+1].at(-1)!);
    }

    return sequences[0].at(-1)!;
  }

  getPreviousNumber(history: number[]): number {
    const sequences: number[][] = [[...history]];

    let lastSequence = sequences.at(-1)!;
    while (lastSequence.some(x => x !== 0)) {
      const nextSequence: number[] = [];
      for (let i = 0; i < lastSequence.length - 1; i++) {
        nextSequence.push(lastSequence[i + 1] - lastSequence[i]);
      }
      sequences.push(nextSequence);
      lastSequence = nextSequence;
    }

    // Unshift a placeholder 0 at the start of each sequence
    sequences.forEach(sequence => sequence.unshift(0));
    for (let i = sequences.length - 2; i >= 0; i--) {
      sequences[i][0] = sequences[i][1] - sequences[i+1][0];
    }

    return sequences[0][0];
  }
}
