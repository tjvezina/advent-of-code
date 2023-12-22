import AbstractChallenge, { Answer } from '@app/abstract-challenge';
import CoordSystem from '@framework/geometry/coord-system';
import Direction from '@framework/geometry/direction';
import Point from '@framework/geometry/point';

export default class Challenge extends AbstractChallenge {
  title = 'Step Counter';

  grid!: string[];
  width!: number;
  height!: number;
  start!: Point;

  init(): void {
    CoordSystem.setActive(CoordSystem.YDown);

    this.grid = this.input.split(/\r?\n/);
    this.width = this.grid[0].length;
    this.height = this.grid.length;

    startLoop:
    for (let y = 0; y < this.grid.length; y++) {
      const row = this.grid[y];
      for (let x = 0; x < row.length; x++) {
        if (row[x] === 'S') {
          this.start = new Point(x, y);
          break startLoop;
        }
      }
    }
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 3578;
  solvePart1(): [string, Answer] {
    const STEP_COUNT = 64;

    let openSet = [this.start.clone()];
    const closedSet = new Set(`${this.start}`);
    const targetPosList: Point[] = (STEP_COUNT % 2 === 0 ? [this.start.clone()] : []);

    for (let i = 0; i < STEP_COUNT; i++) {
      const nextOpenSet: Point[] = [];

      while (openSet.length > 0) {
        const pos = openSet.shift()!;
        const neighborList = Direction.values().map(dir => pos.clone().move(dir))
          .filter(neighbor => !closedSet.has(`${neighbor}`) && this.grid[neighbor.y]?.[neighbor.x] === '.');

        nextOpenSet.push(...neighborList);
        neighborList.forEach(neighbor => closedSet.add(`${neighbor}`));

        if ((i + 1) % 2 === STEP_COUNT % 2) {
          targetPosList.push(...neighborList);
        }
      }

      openSet = nextOpenSet;
    }

    return [`The elf could reach {0} gardens in ${STEP_COUNT} steps`, targetPosList.length];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 594115391548176;
  solvePart2(): [string, Answer] {
    const STEP_COUNT = 26_501_365;

    /*
     * Some notes about the input that greatly simplifies this calculation:
     *
     * The step count lines up exactly with the edge of a block.
     *
     * The center row/column, outer edges, and diagonals between edges of each block are not rocks,
     * so the outer limits of the total reachable space is a perfect diamond.
     *
     * There are fully enclosed and thus unreachable parts of the map, so pathfinding is necessary.
     *
     * The grid can be divided into 1 center diamond and 4 corners, which can be combined to equal the final area.
     */

    // Start by fully traversing a single block, to determine the number of even/odd tiles in each section
    const tileCountsBySection = {
      diamond: { odd: 0, even: 1 }, // Start position
      topLeft: { odd: 0, even: 0 },
      topRight: { odd: 0, even: 0 },
      bottomLeft: { odd: 0, even: 0 },
      bottomRight: { odd: 0, even: 0 },
    };

    let openSet = [this.start.clone()];
    const closedSet = new Set(`${this.start}`);

    for (let i = 0; i < STEP_COUNT; i++) {
      const parity = (i % 2 === 0 ? 'odd' : 'even');
      const nextOpenSet: Point[] = [];

      while (openSet.length > 0) {
        const pos = openSet.shift()!;
        const neighborList = Direction.values().map(dir => pos.clone().move(dir))
          .filter(neighbor => !closedSet.has(`${neighbor}`) && this.grid[neighbor.y]?.[neighbor.x] === '.');

        for (const neighbor of neighborList) {
          nextOpenSet.push(neighbor);
          closedSet.add(`${neighbor}`);

          let section: keyof typeof tileCountsBySection;
          if (Point.getTaxiDist(this.start, neighbor) < this.width / 2) {
            section = 'diamond';
          } else if (neighbor.y < this.height / 2) {
            if (neighbor.x < this.width / 2) {
              section = 'topLeft';
            } else {
              section = 'topRight';
            }
          } else {
            if (neighbor.x < this.width / 2) {
              section = 'bottomLeft';
            } else {
              section = 'bottomRight';
            }
          }

          tileCountsBySection[section][parity]++;
        }
      }

      openSet = nextOpenSet;
    }

    const halfBlockWidth = (STEP_COUNT - Math.floor(this.width / 2)) / this.width;

    const evenFullBlockCount = halfBlockWidth * halfBlockWidth;
    const oddFullBlockCount = (halfBlockWidth - 1) * (halfBlockWidth - 1);
    const largeEdgeBlockCount = halfBlockWidth - 1;
    const smallEdgeBlockCount = halfBlockWidth;

    const { diamond: di, topLeft: tl, topRight: tr, bottomLeft: bl, bottomRight: br } = tileCountsBySection;
    let totalTileCount = 0;

    // Full blocks
    totalTileCount += evenFullBlockCount * (di.even + tl.even + tr.even + bl.even + br.even);
    totalTileCount += oddFullBlockCount * (di.odd + tl.odd + tr.odd + bl.odd + br.odd);

    // Large edge blocks
    totalTileCount += largeEdgeBlockCount * (di.odd + tl.odd + tr.odd + bl.odd);
    totalTileCount += largeEdgeBlockCount * (di.odd + tl.odd + tr.odd + br.odd);
    totalTileCount += largeEdgeBlockCount * (di.odd + tl.odd + bl.odd + br.odd);
    totalTileCount += largeEdgeBlockCount * (di.odd + tr.odd + bl.odd + br.odd);

    // Small edge blocks
    totalTileCount += smallEdgeBlockCount * tl.even;
    totalTileCount += smallEdgeBlockCount * tr.even;
    totalTileCount += smallEdgeBlockCount * bl.even;
    totalTileCount += smallEdgeBlockCount * br.even;

    // Corners
    totalTileCount += di.odd + tl.odd + tr.odd;
    totalTileCount += di.odd + tr.odd + br.odd;
    totalTileCount += di.odd + br.odd + bl.odd;
    totalTileCount += di.odd + bl.odd + tl.odd;

    return [`The elf could reach {0} gardens in ${STEP_COUNT.toLocaleString()} steps`, totalTileCount];
  }
}
