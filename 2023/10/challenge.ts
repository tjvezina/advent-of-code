import AbstractChallenge, { Answer } from '@app/abstract-challenge';
import CoordSystem from '@framework/geometry/coord-system';
import Direction from '@framework/geometry/direction';
import Point from '@framework/geometry/point';

const PIPES = ['|', '-', 'L', 'J', '7', 'F'] as const;
type Pipe = typeof PIPES[number];
const PIPE_DIR_MAP: Record<Pipe, [Direction, Direction]> = {
  '|': [Direction.Up,    Direction.Down ],
  '-': [Direction.Left,  Direction.Right],
  'L': [Direction.Up,    Direction.Right],
  'J': [Direction.Up,    Direction.Left ],
  '7': [Direction.Down,  Direction.Left ],
  'F': [Direction.Right, Direction.Down ],
};

// Indicates which pipes could be in a given direction and connected to the current one
const PIPE_MAP: Record<Direction, Pipe[]> = {
  [Direction.Up]: ['|', '7', 'F'],
  [Direction.Right]: ['-', 'J', '7'],
  [Direction.Down]: ['|', 'L', 'J'],
  [Direction.Left]: ['-', 'L', 'F'],
};

export default class Challenge extends AbstractChallenge {
  title = 'Pipe Maze';

  map!: (Pipe | null)[][];
  start!: Point;

  pipeLoop: Point[] = [];

  init(): void {
    CoordSystem.setActive(CoordSystem.YDown);

    const lines = this.input.split(/\r?\n/);

    this.map = lines.map((line, y) => [...line].map((char, x) => {
      if (char === '.') {
        return null;
      }
      if (char === 'S') {
        this.start = new Point(x, y);
        return null; // Placeholder value
      }
      return char as Pipe;
    }));

    const connectedDirs = Direction.values().filter(dir => {
      const neighbor = this.getNeighbor(this.start, dir);
      return neighbor !== undefined && neighbor !== null && PIPE_MAP[dir].includes(neighbor);
    });

    if (connectedDirs.length !== 2) {
      throw new Error('Failed to determine start pipe shape, expected only 2 neighbors');
    }

    const startPipe = (Object.keys(PIPE_DIR_MAP) as Pipe[]).find(pipe => connectedDirs.every(dir => PIPE_DIR_MAP[pipe].includes(dir)))!;
    this.map[this.start.y][this.start.x] = startPipe;
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 6890;
  solvePart1(): [string, Answer] {
    this.pipeLoop.push(this.start.clone());

    let currentDir = PIPE_DIR_MAP[this.getPipe(this.start)!][0];
    let currentPos = this.start.clone().move(currentDir);
    while (!currentPos.equals(this.start)) {
      this.pipeLoop.push(currentPos);
      currentDir = PIPE_DIR_MAP[this.getPipe(currentPos)!].filter(dir => dir !== Direction.getOpposite(currentDir))[0];
      currentPos = currentPos.clone().move(currentDir);
    }

    return ['The farthest point from the starting pipe is {0} steps away', this.pipeLoop.length / 2];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 453;
  solvePart2(): [string, Answer] {
    const corners = this.pipeLoop.filter(pos => ['L', 'J', '7', 'F'].includes(this.getPipe(pos)!));

    // Shoelace formula: 2A = (x0*y1 - x1*y0) + (x1*y2 - x2*y1) + . . .
    let area = 0;
    for (let i = 0; i < corners.length; i++) {
      const a = corners[i];
      const b = corners[(i + 1) % corners.length];

      area += (a.x * b.y) - (a.y * b.x);
    }
    area /= 2;
    area = Math.abs(area); // Result may be negative if the pipe loop was negatively oriented

    // Pick's theorem: A = i + b/2 - 1   ==>   i = A - b/2 + 1
    const interiorCount = area - (this.pipeLoop.length / 2) + 1;

    return ['There are {0} squares bounded by the pipe loop', interiorCount];
  }

  getPipe(pos: Point): Pipe | null | undefined {
    return this.map[pos.y]?.[pos.x];
  }

  getNeighbor(pos: Point, dir: Direction): Pipe | null | undefined {
    return this.getPipe(pos.clone().move(dir));
  }
}
