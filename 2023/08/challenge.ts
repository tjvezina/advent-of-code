import AbstractChallenge, { Answer } from '@app/abstract-challenge';
import { lcm } from '@framework/maths';

enum Move { Left, Right }

type Node = {
  left: string,
  right: string,
}

type Step = {
  node: string,
  moveIndex: number,
}

export default class Challenge extends AbstractChallenge {
  title = 'Haunted Wasteland';

  moves!: Move[];
  nodeMap!: Map<string, Node>;

  init(): void {
    const lines = this.input.split(/\r?\n/);

    this.moves = [...lines[0]].map(char => char === 'L' ? Move.Left : Move.Right);

    this.nodeMap = lines.slice(2).reduce((map, line) => {
      const [source, left, right] = line.match(/[A-Z]{3}/g)!;
      map.set(source, { left, right });
      return map;
    }, new Map<string, Node>());
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 23147;
  solvePart1(): [string, Answer] {
    const stepCount = this.calculatePathLength('AAA', (node) => node === 'ZZZ');
    return ['It takes {0} steps to reach ZZZ', stepCount];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 22289513667691;
  solvePart2(): [string, Answer] {
    /* Tests determined that the nodes happen to be arranged in such a way that the path of each ghost eventually loops,
     * that loop only contains a single node ending with Z, and the initial distance from said node is always equal to
     * the loop length. This means we can take the shortcut of pretending each ghost already starts on the target node,
     * and we just want to know when they will align again, i.e. the LCM of each ghost's loop length.
     */
    const currentNodes = [...this.nodeMap.keys()].filter(key => key.endsWith('A'));
    const stepsToTargetNodes = currentNodes.map(node => this.calculatePathLength(node, (node) => node.endsWith('Z')));
    const totalCycleSteps = lcm(...stepsToTargetNodes);
    return ['It takes {0} steps for the ghosts to all reach Z nodes', totalCycleSteps];
  }

  calculatePathLength(startNode: string, endCondition: (node: string) => boolean): number {
    let stepCount = 0;
    let currentNode = startNode;
    while (!endCondition(currentNode)) {
      switch (this.moves[stepCount % this.moves.length]) {
        case Move.Left: currentNode = this.nodeMap.get(currentNode)!.left; break;
        case Move.Right: currentNode = this.nodeMap.get(currentNode)!.right; break;
      }
      stepCount++;
    }
    return stepCount;
  }
}
