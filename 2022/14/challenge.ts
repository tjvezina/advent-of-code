import AbstractChallenge, { Answer } from '@app/abstract-challenge';
import { Color } from '@framework/color';
import { log } from '@framework/console-util';

const AIR = undefined;
const ROCK = 0;
const SAND = 1;

type Bounds = {
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
};

const SAND_START_X = 500;

export default class Challenge extends AbstractChallenge {
  title = 'Regolith Reservoir';

  bounds!: Bounds;
  map!: number[][];

  sandCount = 0;

  init(): void {
    const structures = this.input.split(/\r?\n/)
      .map(line => line.split(' -> ').map(pos => pos.split(',').map(x => parseInt(x))).map(([x, y]) => ({ x, y })));

    this.bounds = structures.flatMap(x => x).reduce(
      (bounds, pos) => ({
        xMin: Math.min(bounds.xMin, pos.x),
        xMax: Math.max(bounds.xMax, pos.x),
        yMin: Math.min(bounds.yMin, pos.y),
        yMax: Math.max(bounds.yMax, pos.y),
      }),
      { xMin: Infinity, xMax: -Infinity, yMin: Infinity, yMax: -Infinity } as Bounds,
    );

    this.map = new Array(this.bounds.yMax + 1).fill(undefined).map(() => [] as number[]);

    for (const structure of structures) {
      const firstPos = structure[0];
      this.map[firstPos.y][firstPos.x] = ROCK;

      for (let i = 0; i < structure.length - 1; i++) {
        const [start, end] = structure.slice(i, i+2);

        if (start.y === end.y) {
          const dir = Math.sign(end.x - start.x);
          let x = start.x;
          do {
            x += dir;
            this.map[start.y][x] = ROCK;
          } while (x !== end.x);
        } else if (start.x === end.x) {
          const dir = Math.sign(end.y - start.y);
          let y = start.y;
          do {
            y += dir;
            this.map[y][start.x] = ROCK;
          } while (y !== end.y);
        } else {
          throw new Error(`Rock structure positions are not axis aligned (${start} -> ${end})`);
        }
      }
    }
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 793;
  solvePart1(): [string, Answer] {
    while (this.dropSand()) {
      this.sandCount++;
    }

    return ['{0} grains of sand come to rest', this.sandCount];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 24166;
  solvePart2(): [string, Answer] {
    // Expand the map to fit all possible sand
    const floor = this.bounds.yMax + 2;
    this.map.push([]);
    this.map.push(new Array(SAND_START_X + floor + 1).fill(undefined).map(() => ROCK));

    while (this.dropSand()) {
      this.sandCount++;
    }

    if (!this.isTestMode) {
      this.drawMap();
    }

    return ['{0} grains of sand come to rest when considering the floor', this.sandCount];
  }

  dropSand(): boolean {
    let x = SAND_START_X;
    let y = 0;

    if (this.map[y][x] !== AIR) {
      return false;
    }

    while (y < this.map.length - 1) {
      if (this.map[y+1][x] === AIR) {
        y++;
        continue;
      }

      if (this.map[y+1][x-1] === AIR) {
        x--;
        y++;
        continue;
      }

      if (this.map[y+1][x+1] === AIR) {
        x++;
        y++;
        continue;
      }

      this.map[y][x] = SAND;
      return true;
    }

    return false;
  }

  drawMap(): void {
    for (let y = 0; y < this.map.length; y++) {
      for (let x = this.bounds.xMin - 1; x <= this.bounds.xMax + 1; x++) {
        const cell = this.map[y][x];
        log.setForeground(cell === SAND ? Color.Yellow : Color.DarkGray);
        log.write(cell === SAND ? '•' : (cell === ROCK ? '█' : ' '));
      }
      log.writeLine();
    }
    log.writeLine();
    log.resetColors();
  }
}
