import AbstractChallenge, { Answer } from '@app/abstract-challenge';

type Cell = typeof SPACE | typeof ELF;

const SPACE = 0;
const ELF = 1;

/* eslint-disable array-bracket-spacing */
const NEIGHBOR_OFFSETS = [
  [ 0, -1],
  [ 0,  1],
  [-1,  0],
  [ 1,  0],
  [-1, -1],
  [ 1, -1],
  [-1,  1],
  [ 1,  1],
];
/* eslint-enable */

export default class Challenge extends AbstractChallenge {
  title = 'Unstable Diffusion';

  elves!: Cell[][];
  round = 0;

  init(): void {
    const lines = this.input.split(/\r?\n/);

    // Roughly estimate how much space we'll need for the elves to spread out
    const arrayPad = Math.round(lines.length * 0.75);
    const arraySize = lines.length + 2*arrayPad;

    this.elves = new Array(arraySize).fill(undefined).map(() => new Array(arraySize).fill(SPACE));

    lines.forEach((line, y) => [...line].forEach((c, x) => { if (c === '#') this.elves[y + arrayPad][x + arrayPad] = ELF; }));
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 4052;
  solvePart1(): [string, Answer] {
    for (let i = 0; i < 10; i++) {
      this.executeRound();
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let elfCount = 0;

    for (let y = 0; y < this.elves.length; y++) {
      const row = this.elves[y];
      for (let x = 0; x < row.length; x++) {
        if (row[x] === SPACE) continue;

        elfCount++;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }

    const spaceCount = (maxX - minX + 1) * (maxY - minY + 1) - elfCount;

    return ['There are {0} spaces in the minimum bounding rect', spaceCount];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 978;
  solvePart2(): [string, Answer] {
    while (this.executeRound());

    return ['The elves don\'t move in round {0}', this.round];
  }

  executeRound(): boolean {
    const moveMap = new Map();

    const moveChecks = [
      {
        neighborIndices: [0, 4, 5],
        move: [0, -1],
      },
      {
        neighborIndices: [1, 6, 7],
        move: [0, 1],
      },
      {
        neighborIndices: [2, 4, 6],
        move: [-1, 0],
      },
      {
        neighborIndices: [3, 5, 7],
        move: [1, 0],
      },
    ];

    for (let i = 0; i < this.round % 4; i++) {
      moveChecks.push(moveChecks.shift()!);
    }

    for (let y = 0; y < this.elves.length; y++) {
      const row = this.elves[y];
      for (let x = 0; x < row.length; x++) {
        if (row[x] === SPACE) continue;

        const neighbors = NEIGHBOR_OFFSETS.map(offset => this.elves[y + offset[1]][x + offset[0]]);

        if (neighbors.every(neighbor => neighbor === SPACE)) {
          continue;
        }

        for (const moveCheck of moveChecks) {
          if (moveCheck.neighborIndices.every(i => neighbors[i] === SPACE)) {
            const movePos = [x + moveCheck.move[0], y + moveCheck.move[1]];
            const key = movePos.join();

            if (moveMap.has(key)) {
              moveMap.delete(key);
            } else {
              moveMap.set(key, { start: [x, y], end: movePos });
            }

            break;
          }
        }
      }
    }

    for (const { start, end } of moveMap.values()) {
      this.elves[start[1]][start[0]] = SPACE;
      this.elves[end[1]][end[0]] = ELF;
    }

    this.round++;

    return (moveMap.size > 0);
  }
}
