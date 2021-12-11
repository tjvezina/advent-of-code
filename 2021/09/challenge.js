import { Point } from '../../framework/geometry.js';
import { log } from '../../framework/console-util.js';
import { Color } from '../../framework/color.js';

const MAP_SIZE = 100;

export const challenge = {
  title: 'Smoke Basin',

  init() {
    this.heightMap = this.input.split(/\r?\n/).map(row => row.split('').map(Number));
  },

  // --- Part 1 --- //
  part1ExpectedAnswer: 436,
  solvePart1() {

    this.lowPoints = [];
    for (let y = 0; y < MAP_SIZE; y++) {
      for (let x = 0; x < MAP_SIZE; x++) {
        if (this.getNeighbors({ x, y }).every(n => this.heightMap[n.y][n.x] > this.heightMap[y][x])) {
          this.lowPoints.push(new Point(x, y));
        }
      }
    }

    const lowPointRiskLevels = this.lowPoints.map(({ x, y }) => this.heightMap[y][x] + 1);

    return ['The sum of all low point risk levels is ', lowPointRiskLevels.reduce((a, b) => a + b)];
  },

  // --- Part 2 --- //
  part2ExpectedAnswer: 1317792,
  solvePart2() {
    const basins = this.lowPoints.map(this.getBasin.bind(this)).sort((a, b) => a.length - b.length);

    // Draw the basin map with random colors
    if (!this.isTestMode) {
      for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
          const height = this.heightMap[y][x];
          const gray = height/9*255;
          log.setBackground(Color.fromRGB(gray, gray, gray));

          const iBasin = basins.findIndex(b => b.some(p => p.equals({ x, y })));
          log.setForeground(Color.fromRGB((iBasin*576.3186) % 255, (iBasin*267.6129) % 255, (iBasin*863.1748) % 255));

          log.write(iBasin === -1 ? '  ' : '<>');
        }
        log.resetBackground();
        log.writeLine();
      }
    }

    return ['The product of the area of the 3 largest basins is ', basins.slice(-3).reduce((a, b) => a * b.length, 1)];
  },

  getNeighbors({ x, y }) {
    return [
      (x > 0 ? new Point(x-1, y) : undefined),
      (y > 0 ? new Point(x, y-1) : undefined),
      (x < MAP_SIZE-1 ? new Point(x+1, y) : undefined),
      (y < MAP_SIZE-1 ? new Point(x, y+1) : undefined),
    ].filter(x => x !== undefined);
  },

  getBasin(lowPoint) {
    const basin = [lowPoint];

    const openSet = [lowPoint];

    while (openSet.length > 0) {
      const point = openSet.shift();

      const higherNeighbors = this.getNeighbors(point).filter(n => {
        const neighborHeight = this.heightMap[n.y][n.x];
        return neighborHeight < 9 && neighborHeight > this.heightMap[point.y][point.x];
      });

      for (const neighbor of higherNeighbors) {
        if (!basin.some(p => p.equals(neighbor))) {
          basin.push(neighbor);
          openSet.push(neighbor);
        }
      }
    }

    return basin;
  },
}