import AbstractChallenge, { Answer } from '@app/abstract-challenge';
import CoordSystem from '@framework/geometry/coord-system';
import Direction from '@framework/geometry/direction';
import Point from '@framework/geometry/point';
import Heap from '@framework/heap';

class Node {
  pos: Point;
  dir: Direction;

  constructor(pos: Point, dir: Direction) {
    this.pos = pos;
    this.dir = dir;
  }

  toString(): string {
    return `${this.pos}-${this.dir}`;
  }
}

export default class Challenge extends AbstractChallenge {
  title = 'Clumsy Crucible';

  grid!: number[][];
  width!: number;
  height!: number;

  init(): void {
    CoordSystem.setActive(CoordSystem.YDown);

    this.grid = this.input.split(/\r?\n/).map(line => [...line].map(x => parseInt(x)));
    this.width = this.grid[0].length;
    this.height = this.grid.length;
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 1013;
  solvePart1(): [string, Answer] {
    const leastHeatLoss = this.findLeastHeatLoss(1, 3);
    return ['The minimum possible heat loss is ', leastHeatLoss];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 1215;
  solvePart2(): [string, Answer] {
    const leastHeatLoss = this.findLeastHeatLoss(4, 10);
    return ['The minimum possible heat loss with ultra crucibles is ', leastHeatLoss];
  }

  findLeastHeatLoss(minLineLength: number, maxLineLength: number): number {
    const start = new Node(Point.Zero, Direction.Right);
    const endPos = new Point(this.width - 1, this.height - 1);

    const gMap = new Map<string, number>([[`${start}`, 0]]);
    const getG = (node: Node): number => gMap.get(`${node}`) ?? Number.MAX_VALUE;

    const openSet = Heap.createMinHeap(getG);
    openSet.insert(start);
    const parentMap = new Map<Node, Node>();

    while (openSet.size > 0) {
      const current = openSet.extract()!;

      if (current.pos.equals(endPos)) {
        return getG(current);
      }

      const neighbors: [Node, number][] = [];
      for (const dir of (current === start ? Direction.values() : Direction.getOrthogonals(current.dir))) {
        let d = 0;
        const pos = current.pos.clone();
        for (let i = 1; i <= maxLineLength; i++) {
          pos.move(dir);
          if (pos.x < 0 || pos.x >= this.width || pos.y < 0 || pos.y >= this.height) {
            break;
          }
          d += this.grid[pos.y][pos.x];
          if (i >= minLineLength) {
            neighbors.push([new Node(pos.clone(), dir), d]);
          }
        }
      }

      for (const [neighbor, d] of neighbors) {
        const gNext = getG(current) + d;

        if (gNext < getG(neighbor)) {
          gMap.set(`${neighbor}`, gNext);
          parentMap.set(neighbor, current);
          if (!openSet.includes(neighbor)) {
            openSet.insert(neighbor);
          }
        }
      }
    }

    throw new Error('No path found');
  }
}
