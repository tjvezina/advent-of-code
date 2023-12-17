import AbstractChallenge, { Answer } from '@app/abstract-challenge';
import CoordSystem from '@framework/geometry/coord-system';
import Point from '@framework/geometry/point';

export default class Challenge extends AbstractChallenge {
  title = 'Parabolic Reflector Dish';

  grid!: string[][];

  init(): void {
    CoordSystem.setActive(CoordSystem.YDown);

    this.grid = this.input.split(/\r?\n/).map(line => [...line]);
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 110274;
  solvePart1(): [string, Answer] {
    const grid = this.grid.map(row => [...row]);
    this.tilt(grid, Point.Up);

    let load = 0;
    for (let y = 0; y < grid.length; y++) {
      const roundRockCount = grid[y].filter(c => c === 'O').length;
      const rowLoad = grid.length - y;

      load += (roundRockCount * rowLoad);
    }

    return ['The total load on the north support beams is {0}', load];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 90982;
  solvePart2(): [string, Answer] {
    const CYCLE = [Point.Up, Point.Left, Point.Down, Point.Right] as const;

    const grid = this.grid.map(row => [...row]);

    const history: string[] = [];

    let stateLoopStart: number;
    let stateLoopLength: number;
    while (true) {
      const key = grid.map(row => row.map((c, x) => ({ c, x })).filter(({ c }) => c === 'O').map(({ x }) => `${x}`).join(',')).join('-');
      if (history.includes(key)) {
        stateLoopStart = history.indexOf(key);
        stateLoopLength = history.length - stateLoopStart;
        break;
      }
      history.push(key);

      CYCLE.forEach(dir => this.tilt(grid, dir));
    }

    const oneBillionthState = history[stateLoopStart + ((1_000_000_000 - stateLoopStart) % stateLoopLength)];

    let load = 0;
    for (const [y, row] of oneBillionthState.split('-').entries()) {
      const roundRockCount = row.split(',').filter(x => x !== '').length;
      const rowLoad = grid.length - y;

      load += (roundRockCount * rowLoad);
    }

    return ['The total load on the north support beams after 1 billion cycles is ', load];
  }

  tilt(grid: string[][], dir: Point): void {
    if (dir.x + dir.y < 0) {
      for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
          this.moveRock(grid, dir, x, y);
        }
      }
    } else {
      for (let y = grid.length - 1; y >= 0; y--) {
        for (let x = grid[y].length - 1; x >= 0; x--) {
          this.moveRock(grid, dir, x, y);
        }
      }
    }
  }

  moveRock(grid: string[][], dir: Point, x: number, y: number): void {
    if (grid[y][x] !== 'O') {
      return;
    }

    let prevPos = new Point(x, y);
    let nextPos = prevPos.clone().add(dir);
    while (grid[nextPos.y]?.[nextPos.x] === '.') {
      prevPos = nextPos;
      nextPos = prevPos.clone().add(dir);
    }

    if (prevPos.x !== x || prevPos.y !== y) {
      grid[y][x] = '.';
      grid[prevPos.y][prevPos.x] = 'O';
    }
  }
}
