import AbstractChallenge, { Answer } from '@app/abstract-challenge';
import CoordSystem from '@framework/geometry/coord-system';
import Point from '@framework/geometry/point';

export default class Challenge extends AbstractChallenge {
  title = 'Parabolic Reflector Dish';

  map!: string[][];

  init(): void {
    CoordSystem.setActive(CoordSystem.YDown);

    this.map = this.input.split(/\r?\n/).map(line => [...line]);
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 110274;
  solvePart1(): [string, Answer] {
    const map = this.map.map(row => [...row]);
    this.tilt(map, Point.Up);

    let load = 0;
    for (let y = 0; y < map.length; y++) {
      const roundRockCount = map[y].filter(c => c === 'O').length;
      const rowLoad = map.length - y;

      load += (roundRockCount * rowLoad);
    }

    return ['The total load on the north support beams is {0}', load];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 90982;
  solvePart2(): [string, Answer] {
    const CYCLE = [Point.Up, Point.Left, Point.Down, Point.Right] as const;

    const map = this.map.map(row => [...row]);

    const history: string[] = [];

    let stateLoopStart: number;
    let stateLoopLength: number;
    while (true) {
      const key = map.map(row => row.map((c, x) => ({ c, x })).filter(({ c }) => c === 'O').map(({ x }) => `${x}`).join(',')).join('-');
      if (history.includes(key)) {
        stateLoopStart = history.indexOf(key);
        stateLoopLength = history.length - stateLoopStart;
        break;
      }
      history.push(key);

      CYCLE.forEach(dir => this.tilt(map, dir));
    }

    const oneBillionthState = history[stateLoopStart + ((1_000_000_000 - stateLoopStart) % stateLoopLength)];

    let load = 0;
    for (const [y, row] of oneBillionthState.split('-').entries()) {
      const roundRockCount = row.split(',').filter(x => x !== '').length;
      const rowLoad = map.length - y;

      load += (roundRockCount * rowLoad);
    }

    return ['The total load on the north support beams after 1 billion cycles is ', load];
  }

  tilt(map: string[][], dir: Point): void {
    if (dir.x + dir.y < 0) {
      for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
          this.moveRock(map, dir, x, y);
        }
      }
    } else {
      for (let y = map.length - 1; y >= 0; y--) {
        for (let x = map[y].length - 1; x >= 0; x--) {
          this.moveRock(map, dir, x, y);
        }
      }
    }
  }

  moveRock(map: string[][], dir: Point, x: number, y: number): void {
    if (map[y][x] !== 'O') {
      return;
    }

    let prevPos = new Point(x, y);
    let nextPos = prevPos.clone().add(dir);
    while (map[nextPos.y]?.[nextPos.x] === '.') {
      prevPos = nextPos;
      nextPos = prevPos.clone().add(dir);
    }

    if (prevPos.x !== x || prevPos.y !== y) {
      map[y][x] = '.';
      map[prevPos.y][prevPos.x] = 'O';
    }
  }
}
