import { Point } from '../../framework/geometry.js'

const UP = { x: 0, y: -1 };
const DOWN = { x: 0, y: 1 };
const LEFT = { x: -1, y: 0 };
const RIGHT = { x: 1, y: 0 };

export const challenge = {
  title: 'Rope Bridge',

  init() {
    const directions = [UP, DOWN, LEFT, RIGHT];

    this.moves = this.input.split(/\r?\n/)
      .map(line => line.match(/([UDLR]) (\d+)/).slice(1, 3))
      .map(([dir, count]) => ({ dir: directions[['U', 'D', 'L', 'R'].indexOf(dir)], count: parseInt(count) }));
  },

  // --- Part 1 --- //
  part1ExpectedAnswer: 6269,
  solvePart1() {
    const head = new Point(0, 0);
    const tail = new Point(0, 0);

    const visited = [new Point(0, 0)];

    this.moves.forEach(move => {
      for (let i = 0; i < move.count; i++) {
        head.x += move.dir.x;
        head.y += move.dir.y;

        const dx = head.x - tail.x;
        const dy = head.y - tail.y;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (absDx <= 1 && absDy <= 1) continue;

        if (absDy === 0) {
          tail.x += Math.sign(dx);
        } else if (absDx === 0) {
          tail.y += Math.sign(dy);
        } else {
          tail.x += Math.sign(dx);
          tail.y += Math.sign(dy);
        }

        if (!visited.some(p => p.equals(tail))) {
          visited.unshift(tail.clone());
        }
      }
    });

    return ['The tail visited {0} positions', visited.length];
  },

  // --- Part 2 --- //
  part2ExpectedAnswer: 2557,
  solvePart2() {
    const rope = new Array(10).fill().map(_ => new Point(0, 0));

    const visited = [new Point(0, 0)];

    this.moves.forEach(move => {
      for (let iStep = 0; iStep < move.count; iStep++) {
        let next = rope[0];
        next.x += move.dir.x;
        next.y += move.dir.y;

        for (let iKnot = 1; iKnot < 10; iKnot++) {
          let prev = next;
          next = rope[iKnot];

          const dx = prev.x - next.x;
          const dy = prev.y - next.y;
          const absDx = Math.abs(dx);
          const absDy = Math.abs(dy);

          if (absDx <= 1 && absDy <= 1) continue;

          if (absDy === 0) {
            next.x += Math.sign(dx);
          } else if (absDx === 0) {
            next.y += Math.sign(dy);
          } else {
            next.x += Math.sign(dx);
            next.y += Math.sign(dy);
          }
        }

        if (!visited.some(p => p.equals(next))) {
          visited.unshift(next.clone());
        }
      }
    });

    return ['The long rope\'s tail visited {0} positions', visited.length];
  },
}