import AbstractChallenge, { Answer } from '@app/abstract-challenge';
import { assert } from 'console';

const DIGIT_NAMES = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

export default class Challenge extends AbstractChallenge {
  title = 'Trebuchet?!';

  lines!: string[];

  init(): void {
    this.lines = this.input.split(/\r?\n/);
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 54159;
  solvePart1(): [string, Answer] {
    const calibrationValues = this.lines.map((line, i) => {
      const digitMatches = [...line.matchAll(/\d/g)];
      assert(digitMatches.length > 0, `No digits found in line ${i}`);
      return Number(digitMatches.at(0)![0] + digitMatches.at(-1)![0]);
    });

    const sum = calibrationValues.reduce((a, b) => a + b);
    return ['The sum of all calibration values is ', sum];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = null;
  solvePart2(): [string, Answer] {
    const calibrationValues = this.lines.map((line, iLine) => {
      let firstDigit: number | null = null;
      for (let i = 0; i < line.length && firstDigit === null; i++) {
        firstDigit = getDigitAtIndex(line, i);
      }
      assert(firstDigit !== null, `No digits found in line ${iLine}`);

      let lastDigit: number | null = null;
      for (let i = line.length - 1; i >= 0 && lastDigit === null; i--) {
        lastDigit = getDigitAtIndex(line, i);
      }

      return Number(`${firstDigit}${lastDigit}`);
    });

    const sum = calibrationValues.reduce((a, b) => a + b);
    return ['The sum of all real calibration values is ', sum];
  }
}

function getDigitAtIndex(line: string, index: number): number | null {
  const sub = line.substring(index);

  if (/\d/g.test(sub[0])) {
    return Number(sub[0]);
  }

  for (const [i, digitName] of DIGIT_NAMES.entries()) {
    if (sub.startsWith(digitName)) {
      return i + 1;
    }
  }

  return null;
}
