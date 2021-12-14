import { Point } from '../../framework/geometry.js';
import { log } from '../../framework/console-util.js';
import { asciiArt } from '../../framework/ascii-art.js';

export const challenge = {
  title: 'Transparent Origami',

  init() {
    const parts = this.input.split(/\r?\n\r?\n/);

    this.points = parts[0].split(/\r?\n/).map(line => new Point(...line.split(',').map(Number)));
    this.folds = parts[1].split(/\r?\n/)
      .map(line => line.match(/(x|y)=(\d+)/).slice(1))
      .map(([dir, line]) => ({ dir, line: Number(line)}));
  },

  // --- Part 1 --- //
  part1ExpectedAnswer: 763,
  solvePart1() {
    this.fold(this.folds[0]);

    return ['After the first fold, there are {0} dots', this.points.length];
  },

  // --- Part 2 --- //
  part2ExpectedAnswer: 'RHALRCRA',
  solvePart2() {
    this.folds.slice(1).forEach(fold => this.fold(fold));

    const height = this.points.reduce((height, p) => Math.max(height, p.y + 1), 0);

    const image = new Array(height).fill().map(_ => []);
    for (const p of this.points) {
      image[p.y][p.x] = true;
    }

    if (!this.isTestMode) {
      asciiArt.draw(image);
    }

    return ['The message formed by the folded paper is ', asciiArt.imageToText(image)];
  },

  fold({ dir, line }) {
    const { points } = this;

    points.forEach(p => {
      if (dir === 'x' && p.x > line) {
        p.x -= (p.x - line) * 2;
      }
      if (dir === 'y' && p.y > line) {
        p.y -= (p.y - line) * 2;
      }
    });

    for (let i = points.length - 1; i >= 0; i--) {
      const p = points[i];
      for (let j = i - 1; j >= 0; j--) {
        if (p.equals(points[j])) {
          points.splice(i, 1);
          break;
        }
      }
    }
  }
}