import { Point } from '../../framework/geometry.js';
import { pathfinder } from '../../framework/pathfinder.js';
import { log } from '../../framework/console-util.js';
import { Color } from '../../framework/color.js';

const NEIGHBOR_OFFSETS = [
  { x: 1, y: 0 },
  { x:-1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y:-1 },
];

export const challenge = {
  title: 'Hill Climbing Algorithm',

  init() {
    this.heightMap = this.input.split(/\r?\n/).map((line, y) => [...line].map((c, x) => {
      const node = { x, y };

      if (c === 'S') {
        c = 'a';
        this.start = node;
      }
      if (c === 'E') {
        c = 'z';
        this.end = node;
      }

      node.height = (c.charCodeAt(0) - 'a'.charCodeAt(0));
      return node;
    }));
  },

  // --- Part 1 --- //
  part1ExpectedAnswer: 380,
  solvePart1() {
    const getNeighbors = (node) => this.getNeighbors(node).filter(neighbor => neighbor.height <= node.height + 1);
    const getD = () => 1;
    const getH = (p, end) => getTaxiDist(p, end);

    const path = pathfinder.findPath(this.start, this.end, getNeighbors, getD, getH);

    for (const row of this.heightMap) {
      for (const node of row) {
        log.setForeground(path.includes(node) ? Color.Green : Color.DarkGray);
        log.write(String.fromCharCode('a'.charCodeAt(0) + node.height));
      }
      log.writeLine();
    }

    return ['The shortest path to the highest point is {0} steps', path.length];
  },

  // --- Part 2 --- //
  part2ExpectedAnswer: 375,
  solvePart2() {
    // Search backwards from the initial end to any point with height 0
    const start = this.end;
    const ends = this.heightMap.flatMap(x => x).filter(node => node.height === 0).filter(node => 
      this.getNeighbors(node).some(neighbor => neighbor.height === 1)
    );
    console.log(ends.length);

    const path = this.findPathMultipleEnds(start, ends);

    for (const row of this.heightMap) {
      for (const node of row) {
        log.setForeground(path.includes(node) ? Color.Green : Color.DarkGray);
        log.write(String.fromCharCode('a'.charCodeAt(0) + node.height));
      }
      log.writeLine();
    }

    return ['The shortest path for a hiking trail is {0} steps', path.length];
  },

  findPathMultipleEnds(start, ends) {
    const openSet = [start];
    const parentMap = new Map();

    const gMap = new Map([[start, 0]]);
    const fMap = new Map([[start, getH(start)]]);

    while (openSet.length > 0) {
      const current = openSet.sort((a, b) => getF(b) - getF(a)).pop();

      if (current.height === 0) {
        const path = [];
        let node = current;
        while (parentMap.has(node)) {
          path.push(node);
          node = parentMap.get(node);
        }
        return path.reverse();
      }

      const neighbors = this.getNeighbors(current).filter(neighbor => neighbor.height >= current.height - 1);

      if (parentMap.has(current)) {
        neighbors.splice(neighbors.indexOf(parentMap.get(current)), 1);
      }

      for (const neighbor of neighbors) {
        const gNext = getG(current) + 1;

        if (gNext < getG(neighbor)) {
          gMap.set(neighbor, gNext);
          fMap.set(neighbor, gNext + getH(neighbor));
          parentMap.set(neighbor, current);
          if (!openSet.includes(neighbor)) {
            openSet.push(neighbor);
          }
        }
      }
    }

    return null;

    function getH(node) { return ends.map(end => getTaxiDist(node, end)).sort((a, b) => a - b)[0]; }
    function getG(node) { return gMap.get(node) ?? Number.MAX_VALUE; }
    function getF(node) { return fMap.get(node) ?? Number.MAX_VALUE; }
  },

  getNeighbors(node) {
    return NEIGHBOR_OFFSETS
      .map(offset => ({ x: node.x + offset.x, y: node.y + offset.y }))
      .filter(pos => pos.x >= 0 && pos.x < this.heightMap[0].length && pos.y >= 0 && pos.y < this.heightMap.length)
      .map(pos => this.heightMap[pos.y][pos.x]);
  }
}

function getTaxiDist(a, b) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); }