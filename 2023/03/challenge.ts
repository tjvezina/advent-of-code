import AbstractChallenge, { Answer } from '@app/abstract-challenge';
import { Point } from '@framework/geometry';

export default class Challenge extends AbstractChallenge {
  title = 'Gear Ratios';

  schematic!: string[][];
  width!: number;
  height!: number;

  init(): void {
    const lines = this.input.split(/\r?\n/);
    this.schematic = lines.map(line => [...line]);
    this.width = lines[0].length;
    this.height = lines.length;
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 539433;
  solvePart1(): [string, Answer] {
    const partNumbers: number[] = [];

    for (let y = 0; y < this.height; y++) {
      const row = this.schematic[y];
      for (let x = 0; x < this.width; x++) {
        const char = row[x];
        if (!/\d/.test(char)) {
          continue;
        }

        const xStart = x;
        let numberStr = char;
        while (x + 1 < this.width && /\d/.test(row[x + 1])) {
          numberStr += row[x + 1];
          x++;
        }
        const xEnd = x;

        const neighbors: Point[] = [];
        if (xStart > 0) {
          neighbors.push(new Point(xStart - 1, y));
        }
        if (xEnd + 1 < this.width) {
          neighbors.push(new Point(xEnd + 1, y));
        }
        for (let xNeighbor = xStart - 1; xNeighbor <= x + 1; xNeighbor++) {
          if (xNeighbor < 0 || xNeighbor >= this.width) {
            continue;
          }
          if (y > 0) {
            neighbors.push(new Point(xNeighbor, y - 1));
          }
          if (y + 1 < this.height) {
            neighbors.push(new Point(xNeighbor, y + 1));
          }
        }

        if (neighbors.some(neighbor => !/(\d|\.)/.test(this.schematic[neighbor.y][neighbor.x]))) {
          partNumbers.push(Number(numberStr));
        }
      }
    }

    const partNumberSum = partNumbers.reduce((a, b) => a + b);
    return ['The sum of all part numbers in the schematic is ', partNumberSum];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = null;
  solvePart2(): [string, Answer] {
    const gearRatios: number[] = [];

    for (let y = 0; y < this.height; ++y) {
      const row = this.schematic[y];
      for (let x = 0; x < this.width; ++x) {
        const char = row[x];

        if (char !== '*') {
          continue;
        }

        let neighbors: Point[] = [];
        for (let xNeighbor = x - 1; xNeighbor <= x + 1; xNeighbor++) {
          if (xNeighbor < 0 || xNeighbor >= this.width) {
            continue;
          }
          for (let yNeighbor = y - 1; yNeighbor <= y + 1; yNeighbor++) {
            if (yNeighbor < 0 || yNeighbor >= this.height || (xNeighbor === x && yNeighbor === y)) {
              continue;
            }

            neighbors.push(new Point(xNeighbor, yNeighbor));
          }
        }

        const partNumbers: number[] = [];

        while (neighbors.length > 0) {
          const neighbor = neighbors.pop() as Point;
          const neighborRow = this.schematic[neighbor.y];

          if (!/\d/.test(neighborRow[neighbor.x])) {
            continue;
          }

          let xStart = neighbor.x;
          while (xStart - 1 >= 0 && /\d/.test(neighborRow[xStart - 1])) {
            xStart--;
          }
          let xEnd = neighbor.x;
          while (xEnd + 1 < this.width && /\d/.test(neighborRow[xEnd + 1])) {
            xEnd++;
          }

          const partNumber = Number(neighborRow.slice(xStart, xEnd + 1).join(''));
          partNumbers.push(partNumber);

          neighbors = neighbors.filter(n => n.y !== neighbor.y || n.x < xStart || n.x > xEnd);
        }

        if (partNumbers.length === 2) {
          const gearRatio = partNumbers[0] * partNumbers[1];
          gearRatios.push(gearRatio);
        }
      }
    }

    const gearRatioSum = gearRatios.reduce((a, b) => a + b);
    return ['The sum of all gear ratios is ', gearRatioSum];
  }
}
