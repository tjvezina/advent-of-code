import AbstractChallenge, { Answer } from '@app/abstract-challenge';

enum State {
  Invalid = -1,
  Inconclusive = 0,
  Valid = 1,
}

type Packet = (number | Packet)[];

export default class Challenge extends AbstractChallenge {
  title = 'Distress Signal';

  packetPairs!: Packet[][];

  init(): void {
    const lines = this.input.split(/\r?\n/);

    this.packetPairs = [];

    for (let i = 0; i < lines.length; i += 3) {
      this.packetPairs.push(lines.slice(i, i + 2).map(line => JSON.parse(line)));
    }
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 6070;
  solvePart1(): [string, Answer] {
    let validIndexSum = 0;
    for (let i = 0; i < this.packetPairs.length; i++) {
      const pair = this.packetPairs[i];
      const state = comparePackets(pair[0], pair[1]);

      if (state === State.Inconclusive) {
        throw new Error(`Failed to determine whether pair ${i} is valid`);
      }

      if (state === State.Valid) {
        validIndexSum += (i + 1);
      }
    }

    return ['The sum of the valid packet indicies is ', validIndexSum];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 20758;
  solvePart2(): [string, Answer] {
    const dividerA = [[2]];
    const dividerB = [[6]];

    const packets = [...this.packetPairs.flatMap(x => x), dividerA, dividerB].sort((a, b) => -comparePackets(a, b));

    const indexA = packets.indexOf(dividerA) + 1;
    const indexB = packets.indexOf(dividerB) + 1;

    return [`The dividers are at ${indexA} and ${indexB}, thus the decoder key is `, indexA * indexB];
  }
}

function comparePackets(a: Packet, b: Packet): State {
  for (let i = 0; true; i++) {
    let x = a[i];
    let y = b[i];

    if (x === undefined && y === undefined) {
      return State.Inconclusive;
    }
    if (x === undefined) {
      return State.Valid;
    }
    if (y === undefined) {
      return State.Invalid;
    }

    if (typeof x === 'number' && typeof y === 'number') {
      if (x !== y) {
        return (x < y ? State.Valid : State.Invalid);
      }
      continue;
    }

    if (typeof x === 'number') {
      x = [x];
    }
    if (typeof y === 'number') {
      y = [y];
    }

    const result = comparePackets(x, y);

    if (result !== State.Inconclusive) {
      return result;
    }
  }
}
