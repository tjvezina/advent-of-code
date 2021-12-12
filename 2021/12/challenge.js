class Node {
  constructor(name) {
    this.name = name;
    this.neighbors = [];
    this.isLarge = /[A-Z]/.test(name);
  }

  addConnection(node) {
    this.neighbors.push(node);
  }
}

export const challenge = {
  title: 'Passage Pathing',

  init() {
    this.connections = this.input.split(/\r?\n/).map(line => line.split('-'));

    const nodeMap = new Map();

    for (const [from, to] of this.connections) {
      const fromNode = (nodeMap.has(from) ? nodeMap.get(from) : nodeMap.set(from, new Node(from)).get(from));
      const toNode = (nodeMap.has(to) ? nodeMap.get(to) : nodeMap.set(to, new Node(to)).get(to));

      fromNode.addConnection(toNode);
      toNode.addConnection(fromNode);
    }

    this.nodeMap = nodeMap;
  },

  // --- Part 1 --- //
  part1ExpectedAnswer: 3292,
  solvePart1() {
    return ['There are {0} valid paths from start to end', this.countPaths()];
  },

  // --- Part 2 --- //
  part2ExpectedAnswer: 89592,
  solvePart2() {
    return ['There are {0} valid paths from start to end', this.countPaths(true)];
  },

  countPaths(allowOneSmallCaveTwice = false) {
    const startNode = this.nodeMap.get('start');

    const openPaths = [[startNode]];
    const closedPaths = [];

    while (openPaths.length > 0) {
      const path = openPaths.shift();
      const lastNode = path.slice(-1)[0];

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
  },
}