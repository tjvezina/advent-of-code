import AbstractChallenge, { Answer } from '@app/abstract-challenge';
import CoordSystem from '@framework/geometry/coord-system';
import Direction from '@framework/geometry/direction';
import Point from '@framework/geometry/point';

type Step = {
  dir: Direction,
  length: number,
  color: string,
}

export default class Challenge extends AbstractChallenge {
  title = 'Lavaduct Lagoon';

  stepList!: Step[];

  init(): void {
    CoordSystem.setActive(CoordSystem.YUp);

    this.stepList = this.input.split(/\r?\n/).map(line => {
      const [, dirStr, lengthStr, color] = line.match(/(R|D|L|U) (\d+) \(#([0-9a-f]{6})\)/)!;
      let dir: Direction;
      switch (dirStr) {
        case 'R': dir = Direction.Right; break;
        case 'D': dir = Direction.Down;  break;
        case 'L': dir = Direction.Left;  break;
        case 'U': dir = Direction.Up;    break;
        default:
          throw new Error('Unknown direction');
      }
      return { dir, length: parseInt(lengthStr), color };
    });
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 50746;
  solvePart1(): [string, Answer] {
    const digVolume = this.calculateDigVolume(this.stepList);

    return ['The excavated lagoon could hold {0} cubic meters of lava', digVolume];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 70086216556038;
  solvePart2(): [string, Answer] {
    const correctedStepList = this.stepList.map(({ color }) => {
      const length = parseInt(color.substring(0, 5), 16);
      const dir: Direction = parseInt(color.substring(5));
      return { dir, length };
    });

    const digVolume = this.calculateDigVolume(correctedStepList);

    return ['The excavated lagoon could hold {0} cubic meters of lava', digVolume];
  }

  calculateDigVolume(steps: { dir: Direction, length: number }[]): number {
    const pos = Point.Zero;
    const corners: Point[] = [];

    for (const { dir, length } of steps) {
      pos.move(dir, length);
      corners.push(pos.clone());
    }

    if (!pos.equals(Point.Zero)) {
      throw new Error('Steps did not lead back to start position, no loop was formed');
    }

    // Shoelace formula: 2A = (x0*y1 - x1*y0) + (x1*y2 - x2*y1) + . . .
    let area = 0;
    for (let i = 0; i < corners.length; i++) {
      const a = corners[i];
      const b = corners[(i + 1) % corners.length];

      area += (a.x * b.y) - (a.y * b.x);
    }
    area /= 2;
    area = Math.abs(area); // Result may be negative if the loop was negatively oriented

    const perimeter = steps.map(({ length }) => length).reduce((a, b) => a + b);

    // Pick's theorem: A = i + b/2 - 1   ==>   i = A - b/2 + 1
    const interiorArea = area - (perimeter / 2) + 1;

    return perimeter + interiorArea;
  }
}
