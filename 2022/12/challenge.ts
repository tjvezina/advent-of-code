import AbstractChallenge, { Answer } from '@app/abstract-challenge';
import { Color } from '@framework/color';
import { log } from '@framework/console-util';
import { Point } from '@framework/geometry';
import Heap from '@framework/heap';
import { pathfinder } from '@framework/pathfinder';

const NEIGHBOR_OFFSETS = [
  new Point(1, 0),
  new Point(-1, 0),
  new Point(0, 1),
  new Point(0, -1),
];

type Node = {
  pos: Point,
  height: number,
};

export default class Challenge extends AbstractChallenge {
  title = 'Hill Climbing Algorithm';

  heightMap!: Node[][];
  start!: Node;
  end!: Node;

  init(): void {
    this.heightMap = this.input.split(/\r?\n/).map((line, y) => [...line].map((c, x) => {
      const node = { pos: new Point(x, y) } as Node;

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
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 380;
  solvePart1(): [string, Answer] {
    const getNeighbors = (node: Node): Node[] => this.getNeighbors(node).filter(neighbor => neighbor.height <= node.height + 1);
    const getD = (): number => 1;
    const getH = (p: Node, end: Node): number => Point.getTaxiDist(p.pos, end.pos);

    const path = pathfinder.findPath(this.start, this.end, getNeighbors, getD, getH);

    if (!this.isTestMode) {
      for (const row of this.heightMap) {
        for (const node of row) {
          log.setForeground(path.includes(node) ? Color.Green : Color.DarkGray);
          log.write(String.fromCharCode('a'.charCodeAt(0) + node.height));
        }
        log.writeLine();
      }
    }

    return ['The shortest path to the highest point is {0} steps', path.length];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 375;
  solvePart2(): [string, Answer] {
    // Search backwards from the initial end to any point with height 0
    const start = this.end;
    const ends = this.heightMap.flatMap(x => x).filter(node => node.height === 0).filter(node =>
      this.getNeighbors(node).some(neighbor => neighbor.height === 1),
    );
    console.log(ends.length);

    const path = this.findPathMultipleEnds(start, ends);

    if (!this.isTestMode) {
      for (const row of this.heightMap) {
        for (const node of row) {
          log.setForeground(path.includes(node) ? Color.Green : Color.DarkGray);
          log.write(String.fromCharCode('a'.charCodeAt(0) + node.height));
        }
        log.writeLine();
      }
    }

    return ['The shortest path for a hiking trail is {0} steps', path.length];
  }

  findPathMultipleEnds(start: Node, ends: Node[]): Node[] {
    const openSet = Heap.createMinHeap(getF);
    openSet.insert(start);
    const parentMap = new Map();

    const gMap = new Map([[start, 0]]);
    const fMap = new Map([[start, getH(start)]]);

    while (openSet.size > 0) {
      const current = openSet.extract()!;

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
            openSet.insert(neighbor);
          }
        }
      }
    }

    throw new Error('Failed to find a valid path');

    function getH(node: Node): number { return ends.map(end => Point.getTaxiDist(node.pos, end.pos)).sort((a, b) => a - b)[0]; }
    function getG(node: Node): number { return gMap.get(node) ?? Number.MAX_VALUE; }
    function getF(node: Node): number { return fMap.get(node) ?? Number.MAX_VALUE; }
  }

  getNeighbors(node: Node): Node[] {
    return NEIGHBOR_OFFSETS
      .map(offset => node.pos.clone().add(offset))
      .filter(pos => pos.x >= 0 && pos.x < this.heightMap[0].length && pos.y >= 0 && pos.y < this.heightMap.length)
      .map(pos => this.heightMap[pos.y][pos.x]);
  }
}
