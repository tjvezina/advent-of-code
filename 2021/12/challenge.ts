import AbstractChallenge, { Answer } from '@app/abstract-challenge';

class Node {
  name: string;
  isLarge: boolean;

  neighbors: Node[] = [];

  constructor(name: string) {
    this.name = name;
    this.isLarge = /[A-Z]/.test(name);
  }

  addConnection(node: Node): void {
    this.neighbors.push(node);
  }
}

export default class Challenge extends AbstractChallenge {
  title = 'Passage Pathing';

  connections!: string[][];
  nodeMap!: Map<string, Node>;

  init(): void {
    this.connections = this.input.split(/\r?\n/).map(line => line.split('-'));

    const nodeMap = new Map();

    for (const [from, to] of this.connections) {
      const fromNode = (nodeMap.get(from) ?? nodeMap.set(from, new Node(from)).get(from));
      const toNode = (nodeMap.get(to) ?? nodeMap.set(to, new Node(to)).get(to));

      fromNode.addConnection(toNode);
      toNode.addConnection(fromNode);
    }

    this.nodeMap = nodeMap;
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 3292;
  solvePart1(): [string, Answer] { return ['There are {0} valid paths from start to end', this.countPaths()]; }

  // --- Part 2 --- //
  part2ExpectedAnswer = 89592;
  solvePart2(): [string, Answer] { return ['There are {0} valid paths from start to end', this.countPaths(true)]; }

  countPaths(allowOneSmallCaveTwice = false): number {
    const startNode = this.nodeMap.get('start')!;

    const openPaths = [[startNode]];
    const closedPaths = [];

    while (openPaths.length > 0) {
      const path = openPaths.pop()!;
      const lastNode = path.slice(-1)[0]!;

      for (const neighbor of lastNode.neighbors) {
        if (neighbor.name === 'end') {
          closedPaths.push([...path, neighbor]);
          continue;
        }

        if (path.includes(neighbor) && !neighbor.isLarge) {
          if (allowOneSmallCaveTwice && neighbor.name !== 'start') {
            const duplicates = path.filter((node, i) => path.indexOf(node) !== i);
            if (duplicates.every(node => node.isLarge)) {
              openPaths.push([...path, neighbor]);
            }
          }

          continue;
        }

        openPaths.push([...path, neighbor]);
      }
    }

    return closedPaths.length;
  }
}
