import AbstractChallenge, { Answer } from '@app/abstract-challenge';
import Point from '@framework/geometry/point';
import Heap from '@framework/heap';
import Maths from '@framework/maths';

class Node {
  pos: Point;
  time: number;

  constructor(pos: Point, time: number) {
    this.pos = pos;
    this.time = time;
  }

  get key(): string { return [this.pos.x, this.pos.y, this.time].join(); }

  toString(): string { return `(${this.pos})@${this.time}`; }
}

const NEIGHBOR_OFFSETS = [
  new Point(0, 0),
  new Point(1, 0),
  new Point(0, 1),
  new Point(-1, 0),
  new Point(0, -1),
];

export default class Challenge extends AbstractChallenge {
  title = 'Blizzard Basin';

  map!: string[][];
  width!: number;
  height!: number;

  startPos!: Point;
  endPos!: Point;

  firstTripTime!: number;

  init(): void {
    const lines = this.input.split(/\r?\n/);

    // Ignore the walls when building the grid, treating start/end as outside the grid
    this.map = lines.slice(1, -1).map(line => [...line].slice(1, -1));
    this.width = this.map[0].length;
    this.height = this.map.length;

    this.startPos = new Point(0, -1);
    this.endPos = new Point(this.width - 1, this.height);
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 264;
  solvePart1(): [string, Answer] {
    const path = this.findPath(this.startPos, this.endPos, 0);

    this.firstTripTime = path.length;

    return ['It will take at best {0} minutes to reach the end', this.firstTripTime];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 789;
  solvePart2(): [string, Answer] {
    let totalTime = this.firstTripTime;
    let path;

    path = this.findPath(this.endPos, this.startPos, totalTime);
    totalTime += path.length;

    path = this.findPath(this.startPos, this.endPos, totalTime);
    totalTime += path.length;

    return ['It will take {0} minutes to traverse the valley twice', totalTime];
  }

  findPath(startPos: Point, endPos: Point, startTime: number): Node[] {
    const start = new Node(startPos, startTime);
    const end = new Node(endPos, 0);

    const openSet = Heap.createMinHeap(getF);
    openSet.insert(start);
    const parentMap = new Map<Node, Node>();

    const gMap = new Map([[start.key, 0]]);
    const fMap = new Map([[start.key, getH(start, end)]]);

    function getG(node: Node): number { return gMap.get(node.key) ?? Number.MAX_SAFE_INTEGER; }
    function getF(node: Node): number { return fMap.get(node.key) ?? Number.MAX_SAFE_INTEGER; }
    function getH(a: Node, b: Node): number { return Point.getTaxiDist(a.pos, b.pos); }

    while (openSet.size > 0) {
      const current = openSet.extract()!;

      if (current.pos.equals(end.pos)) {
        const path = [];
        let node = current;
        while (parentMap.has(node)) {
          path.push(node);
          node = parentMap.get(node)!;
        }
        return path.reverse();
      }

      const neighbors = this.getNeighbors(current, startPos, endPos);

      for (const neighbor of neighbors) {
        const gNext = getG(current) + 1;

        if (gNext < getG(neighbor)) {
          gMap.set(neighbor.key, gNext);
          fMap.set(neighbor.key, gNext + getH(neighbor, end));
          parentMap.set(neighbor, current);
          openSet.insert(neighbor);
        }
      }
    }

    throw new Error('Failed to find a valid path');
  }

  getNeighbors(node: Node, startPos: Point, endPos: Point): Node[] {
    const neighbors = [];

    const time = node.time + 1;

    for (const offset of NEIGHBOR_OFFSETS) {
      const pos = new Point(node.pos.x + offset.x, node.pos.y + offset.y);

      if (pos.equals(endPos)) {
        return [new Node(pos, node.time + 1)];
      }

      // Staying at the start pos until there is an opening is allowed
      if (!(offset.x === 0 && offset.y === 0 && pos.equals(startPos))) {
        if (pos.x < 0 || pos.x >= this.map[0].length || pos.y < 0 || pos.y >= this.map.length) {
          continue;
        }

        // If a blizzard occupies this space at this time, it is blocked
        if (this.map[pos.y][Maths.mod(pos.x - time, this.width)] === '>') continue;
        if (this.map[pos.y][Maths.mod(pos.x + time, this.width)] === '<') continue;
        if (this.map[Maths.mod(pos.y - time, this.height)][pos.x] === 'v') continue;
        if (this.map[Maths.mod(pos.y + time, this.height)][pos.x] === '^') continue;
      }

      neighbors.push(new Node(pos, time));
    }

    return neighbors;
  }
}
