import { Point } from '../../framework/geometry.js';

class Node {
  constructor(pos, time) {
    Object.assign(this, { pos, time });
  }

  get key() { return [this.pos.x, this.pos.y, this.time].join(); }

  toString() { return `(${this.pos})@${this.time}`; }
}

const BLIZZARD = 0;

const NEIGHBOR_OFFSETS = [
  new Point(0, 0),
  new Point(1, 0),
  new Point(0, 1),
  new Point(-1, 0),
  new Point(0, -1),
];

export const challenge = {
  title: 'Blizzard Basin',

  init() {
    const lines = this.input.split(/\r?\n/);
    
    // Ignore the walls when building the grid, treating start/end as outside the grid
    this.map = lines.slice(1, -1).map(line => [...line].slice(1, -1));
    this.width = this.map[0].length;
    this.height = this.map.length;

    this.startPos = new Point(0, -1);
    this.endPos = new Point(this.width - 1, this.height);
  },

  // --- Part 1 --- //
  part1ExpectedAnswer: 264,
  solvePart1() {
    const path = this.findPath(this.startPos, this.endPos, 0);

    this.firstTripTime = path.length;
    
    return ['It will take at best {0} minutes to reach the end', this.firstTripTime];
  },

  // --- Part 2 --- //
  part2ExpectedAnswer: 789,
  solvePart2() {
    let totalTime = this.firstTripTime;
    let path;

    path = this.findPath(this.endPos, this.startPos, totalTime);
    totalTime += path.length;

    path = this.findPath(this.startPos, this.endPos, totalTime);
    totalTime += path.length;

    return ['It will take {0} minutes to traverse the valley twice', totalTime];
  },

  findPath(startPos, endPos, startTime) {
    const start = new Node(startPos, startTime);
    const end = new Node(endPos, undefined);

    const openSet = [start];
    const parentMap = new Map();

    const gMap = new Map([[start.key, 0]]);
    const fMap = new Map([[start.key, getH(start, end)]]);

    function getG(node) { return gMap.get(node.key) ?? Number.MAX_SAFE_INTEGER; }
    function getF(node) { return fMap.get(node.key) ?? Number.MAX_SAFE_INTEGER; }
    function getH(a, b) { return Point.getTaxiDist(a.pos, b.pos); }

    while (openSet.length > 0) {
      const current = openSet.sort((a, b) => getF(b) - getF(a)).pop();

      if (current.pos.equals(end.pos)) {
        const path = [];
        let node = current;
        while (parentMap.has(node)) {
          path.push(node);
          node = parentMap.get(node);
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
          openSet.push(neighbor);
        }
      }
    }

    return null;
  },

  getNeighbors(node, startPos, endPos) {
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
        if (this.map[pos.y][mod(pos.x - time, this.width)] === '>') continue;
        if (this.map[pos.y][mod(pos.x + time, this.width)] === '<') continue;
        if (this.map[mod(pos.y - time, this.height)][pos.x] === 'v') continue;
        if (this.map[mod(pos.y + time, this.height)][pos.x] === '^') continue;
      }

      neighbors.push(new Node(pos, time));
    }

    return neighbors;
  },
}

function mod(x, n) { return ((x % n) + n) % n; }