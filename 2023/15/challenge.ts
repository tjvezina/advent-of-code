import AbstractChallenge, { Answer } from '@app/abstract-challenge';

type Lens = {
  label: string,
  focalLength: number,
}

export default class Challenge extends AbstractChallenge {
  title = 'Lens Library';

  steps!: string[];

  init(): void {
    this.steps = this.input.split(',');
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 511257;
  solvePart1(): [string, Answer] {
    const hashList = this.steps.map(this.hash);

    const hashSum = hashList.reduce((a, b) => a + b);
    return ['The sum of each step\'s hash is ', hashSum];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 239484;
  solvePart2(): [string, Answer] {
    const boxes: Lens[][] = new Array<Lens[]>(256).fill([]).map(array => [...array]);

    for (const step of this.steps) {
      const iEqual = step.indexOf('=');
      if (iEqual !== -1) {
        const label = step.substring(0, iEqual);
        const focalLength = parseInt(step.substring(iEqual + 1));

        const iBox = this.hash(label);
        const iOldLabel = boxes[iBox].findIndex(lens => lens.label === label);
        if (iOldLabel !== -1) {
          boxes[iBox][iOldLabel].focalLength = focalLength;
        } else {
          boxes[iBox].push({ label, focalLength });
        }
      } else {
        const label = step.slice(0, -1);
        const iBox = this.hash(label);
        const iLens = boxes[iBox].findIndex(lens => lens.label === label);
        if (iLens !== -1) {
          boxes[iBox].splice(iLens, 1);
        }
      }
    }

    const focusingPowerList = boxes.flatMap((box, iBox) => box.map((lens, iLens) => {
      return (iBox + 1) * (iLens + 1) * lens.focalLength;
    }));

    const focusingPowerSum = focusingPowerList.reduce((a, b) => a + b);

    return ['The focusing power sum is ', focusingPowerSum];
  }

  hash(input: string): number {
    let output = 0;

    for (let i = 0; i < input.length; i++) {
      output += input.charCodeAt(i);
      output *= 17;
      output %= 256;
    }

    return output;
  }
}
