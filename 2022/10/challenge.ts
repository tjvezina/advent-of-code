import AbstractChallenge, { Answer } from '@app/abstract-challenge';
import { asciiArt } from '@framework/ascii-art';

type Instruction = {
  command: string,
  arg?: number,
};

export default class Challenge extends AbstractChallenge {
  title = 'Cathode-Ray Tube';

  instructions!: Instruction[];
  xHistory!: number[];

  init(): void {
    this.instructions = this.input.split(/\r?\n/)
      .map(line => line.match(/(\w+) ?(.*)?/)!.slice(1, 3))
      .map(([command, arg]) => ({ command, arg: arg !== undefined ? parseInt(arg) : undefined }));
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 13060;
  solvePart1(): [string, Answer] {
    let x = 1;
    this.xHistory = [x];

    this.instructions.forEach(({ command, arg }) => {
      switch (command) {
        case 'noop': {
          this.xHistory.push(x);
          break;
        }
        case 'addx': {
          this.xHistory.push(x, x);
          x += arg as number;
          break;
        }
        default: throw new Error(`Unknown command: "${command}"`);
      }
    });

    let signalSum = 0;
    for (let i = 20; i < this.xHistory.length; i += 40) {
      signalSum += (i * this.xHistory[i]);
    }

    return ['The sum of the interesting signal strengths is ', signalSum];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 'FJUBULRZ';
  solvePart2(): [string, Answer] {
    const image = [];

    for (let y = 0; y < 6; y++) {
      const row = [];

      for (let x = 0; x < 40; x++) {
        const i = ((x+1) + y*40);
        row.push(Math.abs(this.xHistory[i] - x) <= 1);
      }

      image.push(row);
    }

    const message = asciiArt.imageToText(image);

    asciiArt.draw(image);

    return ['The CRT draws the message ', message];
  }
}
