import AbstractChallenge, { Answer } from '@app/abstract-challenge';
import * as Maths from '@framework/maths';

export default class Challenge extends AbstractChallenge {
  title = 'Grove Positioning System';

  numbers!: number[];

  init(): void {
    this.numbers = this.input.split(/\r?\n/).map(x => parseInt(x));
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 2203;
  solvePart1(): [string, Answer] {
    const count = this.numbers.length;
    const indices = new Array(count).fill(undefined).map((_, i) => i);

    for (let i = 0; i < count; i++) {
      const iIndex = indices.findIndex(x => x === i);

      const value = this.numbers[indices[iIndex]];

      indices.splice(wrap(iIndex + value, count), 0, ...indices.splice(iIndex, 1));
    }

    const iStart = indices.findIndex(i => this.numbers[i] === 0);

    const coords = [1000, 2000, 3000].map(iOffset => this.numbers[indices[Maths.mod(iStart + iOffset, count)]]);

    return [`The sum of the grove coords (${coords.join(', ')}) is `, coords.reduce((a, b) => a + b)];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 6641234038999;
  solvePart2(): [string, Answer] {
    const KEY = 811589153;

    const count = this.numbers.length;
    const keyNumbers = this.numbers.map(x => x * KEY);
    const indices = new Array(count).fill(undefined).map((_, i) => i);

    for (let iter = 0; iter < 10; iter++) {
      for (let i = 0; i < count; i++) {
        const iIndex = indices.findIndex(x => x === i);

        const value = keyNumbers[indices[iIndex]];

        indices.splice(wrap(iIndex + Maths.mod(value, count-1), count), 0, ...indices.splice(iIndex, 1));
      }
    }
    const iStart = indices.findIndex(i => keyNumbers[i] === 0);

    const coords = [1000, 2000, 3000].map(iOffset => keyNumbers[indices[Maths.mod(iStart + iOffset, count)]]);

    return [`The sum of the correct grove coords (${coords.join(', ')}) is `, coords.reduce((a, b) => a + b)];
  }
}

function wrap(x: number, n: number): number { return Maths.mod(x + Math.floor(x / n), n); }
