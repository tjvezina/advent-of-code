import AbstractChallenge, { Answer } from '@app/abstract-challenge';
import Point from '@framework/geometry/point';

export default class Challenge extends AbstractChallenge {
  title = 'Trick Shot';

  targetMin!: Point;
  targetMax!: Point;

  minVelocityX!: number;

  init(): void {
    const [x1, x2, y1, y2] = this.input.match(/-?\d+/g)!.map(x => parseInt(x));
    this.targetMin = new Point(x1, y1);
    this.targetMax = new Point(x2, y2);
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 13203;
  solvePart1(): [string, Answer] {
    // The maximum possible initial y-velocity is one less than the target area, so as not to fully overshoot it on descent
    const velocity = new Point(0, -this.targetMin.y - 1);

    // Any x-velocity will do, as long as it reaches zero within the target area
    let xFinal = 0;
    while (xFinal < this.targetMin.x) {
      velocity.x++;

      xFinal = (velocity.x * (velocity.x + 1)) / 2;
    }

    if (xFinal > this.targetMax.x) {
      throw new Error(`Failed to find an initial x-velocity that reaches the target: ${velocity.x} stops at ${xFinal}`);
    }

    this.minVelocityX = velocity.x;

    return [`Firing at (${velocity}), the maximum height reached is `, (velocity.y * (velocity.y + 1)) / 2];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 5644;
  solvePart2(): [string, Answer] {
    const velocityMin = new Point(this.minVelocityX, this.targetMin.y);
    const velocityMax = new Point(this.targetMax.x, -this.targetMin.y - 1);

    let validVelocityCount = 0;
    for (let y = velocityMin.y; y <= velocityMax.y; y++) {
      for (let x = velocityMin.x; x <= velocityMax.x; x++) {
        if (this.doesVelocityReachTarget(new Point(x, y))) {
          validVelocityCount++;
        }
      }
    }

    return ['There are {0} initial velocities that hit the target', validVelocityCount];
  }

  doesVelocityReachTarget(velocity: Point): boolean {
    const pos = new Point(0, 0);

    while (pos.x < this.targetMin.x || pos.y > this.targetMax.y) {
      pos.x += velocity.x;
      pos.y += velocity.y;

      velocity.x -= Math.sign(velocity.x);
      velocity.y -= 1;
    }

    return (pos.x <= this.targetMax.x && pos.y >= this.targetMin.y);
  }
}
