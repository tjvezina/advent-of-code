import AbstractChallenge, { Answer } from '@app/abstract-challenge';
import { Point } from '@framework/geometry';

type Instruction = {
  dir: string,
  dist: number,
};

export default class Challenge extends AbstractChallenge {
  title = 'Dive!';

  instructions!: Instruction[];

  init(): void {
    this.instructions = this.input.split(/\r?\n/).map(line => line.split(' '))
      .map(([dir, dist]: string[]): Instruction => ({ dir, dist: parseInt(dist) }));
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 2070300;
  solvePart1(): [string, Answer] {
    const pos = new Point(0, 0);

    for (const { dir, dist } of this.instructions) {
      switch (dir) {
        case 'forward': pos.x += dist; break;
        case 'down':    pos.y += dist; break;
        case 'up':      pos.y -= dist; break;
        default:
          throw new Error('Unknown direction:' + dir);
      }
    }

    return [`${pos.x} forward x ${pos.y} down = `, pos.x * pos.y];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 2078985210;
  solvePart2(): [string, Answer] {
    const pos = new Point(0, 0);
    let aim = 0;

    for (const { dir, dist } of this.instructions) {
      switch (dir) {
        case 'down':    aim += dist; break;
        case 'up':      aim -= dist; break;
        case 'forward':
          pos.x += dist;
          pos.y += dist * aim;
          break;
        default:
          console.error('Unknown direction:', dir);
      }
    }

    return [`${pos.x} forward x ${pos.y} down = `, pos.x * pos.y];
  }
}
