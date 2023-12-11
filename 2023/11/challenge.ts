import AbstractChallenge, { Answer } from '@app/abstract-challenge';
import Point from '@framework/geometry/point';

export default class Challenge extends AbstractChallenge {
  title = 'Cosmic Expansion';

  width!: number;
  height!: number;
  galaxies: Point[] = [];

  init(): void {
    const lines = this.input.split(/\r?\n/);

    lines.forEach((line, y) => {
      [...line].forEach((char, x) => {
        if (char === '#') {
          this.galaxies.push(new Point(x, y));
        }
      });
    });

    this.width = lines[0].length;
    this.height = lines.length;
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 9639160;
  solvePart1(): [string, Answer] {
    const expandedGalaxies = this.expandGalaxies(this.galaxies, 2);
    const distanceSum = this.sumDistances(expandedGalaxies);
    return ['The total distance between each pair of galaxies is ', distanceSum];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 752936133304;
  solvePart2(): [string, Answer] {
    const expandedGalaxies = this.expandGalaxies(this.galaxies, 1_000_000);
    const distanceSum = this.sumDistances(expandedGalaxies);
    return ['The total distance between each pair of very old galaxies is ', distanceSum];
  }

  expandGalaxies(galaxies: Point[], expansion: number): Point[] {
    const isRowEmpty = new Array(this.height).fill(true);
    const isColEmpty = new Array(this.width).fill(true);

    for (const galaxy of galaxies) {
      isRowEmpty[galaxy.y] = false;
      isColEmpty[galaxy.x] = false;
    }

    const emptyRows = isRowEmpty.map((isEmpty, i) => ({ isEmpty, i })).filter(({ isEmpty }) => isEmpty).map(({ i }) => i);
    const emptyCols = isColEmpty.map((isEmpty, i) => ({ isEmpty, i })).filter(({ isEmpty }) => isEmpty).map(({ i }) => i);

    const expandedGalaxies = galaxies.map(g => g.clone());
    for (const iRow of emptyRows.reverse()) {
      expandedGalaxies.filter(galaxy => galaxy.y > iRow).forEach(galaxy => (galaxy.y += expansion - 1));
    }
    for (const iCol of emptyCols.reverse()) {
      expandedGalaxies.filter(galaxy => galaxy.x > iCol).forEach(galaxy => (galaxy.x += expansion - 1));
    }

    return expandedGalaxies;
  }

  sumDistances(galaxies: Point[]): number {
    let distanceSum = 0;
    for (let i1 = 0; i1 < galaxies.length - 1; i1++) {
      for (let i2 = i1 + 1; i2 < galaxies.length; i2++) {
        distanceSum += Point.getTaxiDist(galaxies[i1], galaxies[i2]);
      }
    }
    return distanceSum;
  }
}
