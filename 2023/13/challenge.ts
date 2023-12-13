import AbstractChallenge, { Answer } from '@app/abstract-challenge';

enum Orientation {
  Vertical,
  Horizontal,
}

type ReflectionAxis = {
  index: number,
  orientation: Orientation,
}

export default class Challenge extends AbstractChallenge {
  title = 'Point of Incidence';

  patterns!: string[][];

  init(): void {
    this.patterns = this.input.split(/(?:\r?\n){2}/).map(patternStr => patternStr.split(/\r?\n/));
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 34993;
  solvePart1(): [string, Answer] {
    const summaryValue = this.calculateReflectionSummaryValue({ allowSmudges: false });

    return ['The reflection axis summary value is ', summaryValue];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 29341;
  solvePart2(): [string, Answer] {
    const summaryValue = this.calculateReflectionSummaryValue({ allowSmudges: true });

    return ['The reflection axis summary value is ', summaryValue];
  }

  calculateReflectionSummaryValue({ allowSmudges }: { allowSmudges: boolean }): number {
    const reflectionAxisList = this.patterns.map((pattern, i) => {
      for (let x = 1; x < pattern[0].length; x++) {
        const axis: ReflectionAxis = { index: x, orientation: Orientation.Vertical };
        if (this.validateReflectionAxis(pattern, axis, { allowSmudges })) {
          return axis;
        }
      }
      for (let y = 1; y < pattern.length; y++) {
        const axis: ReflectionAxis = { index: y, orientation: Orientation.Horizontal };
        if (this.validateReflectionAxis(pattern, axis, { allowSmudges })) {
          return axis;
        }
      }
      throw new Error(`No reflection axis found in pattern ${i}`);
    });

    const verticalAxisList = reflectionAxisList.filter(axis => axis.orientation === Orientation.Vertical);
    const horizontalAxisList = reflectionAxisList.filter(axis => axis.orientation === Orientation.Horizontal);

    return verticalAxisList.map(axis => axis.index).reduce((a, b) => a + b) +
      100 * horizontalAxisList.map(axis => axis.index).reduce((a, b) => a + b);
  }

  validateReflectionAxis(pattern: string[], axis: ReflectionAxis, { allowSmudges = false }: { allowSmudges: boolean }): boolean {
    function getCell(primary: number, secondary: number): string {
      switch (axis.orientation) {
        case Orientation.Vertical: return pattern[secondary][primary];
        case Orientation.Horizontal: return pattern[primary][secondary];
      }
    }

    const i = axis.index;
    let n = pattern[0].length;
    let l = pattern.length;

    if (axis.orientation === Orientation.Horizontal) {
      [n, l] = [l, n];
    }

    let mismatchCellCount = 0;

    for (let offset = 0; offset < Math.min(i, n - i); offset++) {
      for (let secondary = 0; secondary < l; secondary++) {
        if (getCell(i + offset, secondary) !== getCell(i - (offset + 1), secondary)) {
          if (!allowSmudges) {
            return false;
          }

          mismatchCellCount++;
        }
      }
    }

    return (!allowSmudges || mismatchCellCount === 1);
  }
}
