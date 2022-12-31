import AbstractChallenge, { Answer } from '@app/abstract-challenge';
import { Color } from '@framework/color';
import { log } from '@framework/console-util';
import { Point } from '@framework/geometry';

const GRID_SIZE = 10;

export default class Challenge extends AbstractChallenge {
  title = 'Dumbo Octopus';

  grid!: number[][];
  step!: number;

  reset(): void {
    this.grid = this.input.split(/\r?\n/).map(row => [...row].map(x => parseInt(x)));
    this.step = 0;
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 1649;
  solvePart1(): [string, Answer] {
    let totalFlashes = 0;
    for (let i = 0; i < 100; i++) {
      totalFlashes += this.simulateStep();
    }

    return ['After 100 steps, there were {0} octopus flashes', totalFlashes];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 256;
  async solvePart2(): Promise<[string, Answer]> {
    this.drawOctopodes();

    let flashCount = 0;
    do {
      flashCount = this.simulateStep();
      if (!this.isTestMode) {
        log.moveCursor(0, -(GRID_SIZE * 2 + 1));
        this.drawOctopodes();
        await new Promise(resolve => setTimeout(resolve, 40));
      }
    } while (flashCount < GRID_SIZE * GRID_SIZE);

    return ['The first time all octopodes flash at once is step ', this.step];
  }

  simulateStep(): number {
    this.step++;

    // First, increase all energy levels
    for (let y = 0; y < GRID_SIZE; y++) {
      const row = this.grid[y];
      for (let x = 0; x < GRID_SIZE; x++) {
        row[x]++;
      }
    }

    // Check for flashing octopodes recursively
    const flashing: Point[] = [];

    let didAnyFlash;
    do {
      didAnyFlash = false;
      for (let y = 0; y < GRID_SIZE; y++) {
        const row = this.grid[y];
        for (let x = 0; x < GRID_SIZE; x++) {
          const p = new Point(x, y);
          const energyLevel = row[x];
          if (energyLevel > 9 && !flashing.some(f => f.equals(p))) {
            didAnyFlash = true;
            flashing.push(p);
            this.flash(p);
          }
        }
      }
    } while (didAnyFlash);

    // Reset any that flashed to zero energy
    flashing.forEach(p => (this.grid[p.y][p.x] = 0));

    return flashing.length;
  }

  flash({ x, y }: Point): void {
    for (let xOff = -1; xOff <= 1; xOff++) {
      for (let yOff = -1; yOff <= 1; yOff++) {
        const p = new Point(x + xOff, y + yOff);
        if ((xOff === 0 && yOff === 0) || p.x < 0 || p.y < 0 || p.x >= GRID_SIZE || p.y >= GRID_SIZE) {
          continue;
        }
        this.grid[p.y][p.x]++;
      }
    }
  }

  drawOctopodes(): void {
    log.setForeground(Color.DarkCyan, { bold: true });
    log.writeLine(`                Time: ${`${this.step}`.padStart(2, ' ')}`);
    log.write(new Array(GRID_SIZE * 2).fill('\n').join(''));
    log.moveCursor(0, -GRID_SIZE * 2);

    for (let y = 0; y < GRID_SIZE; y++) {
      log.setBackground(Color.Black);
      for (let x = 0; x < GRID_SIZE; x++) {
        this.drawOctopus(this.grid[y][x]);
      }
      log.resetBackground();
      log.write('\n\n');
    }
  }

  drawOctopus(energyLevel: number): void {
    log.setForeground(
      energyLevel === 0
        ? Color.fromRGB(255, 255, 220)
        : Color.fromRGB((energyLevel-5)/4*127, energyLevel/9*191, energyLevel/9*383),
      { bold: energyLevel === 0 },
    );
    log.write(energyLevel === 0 ? '(^^)' : '(••)');
    log.moveCursor(-4, 1);
    log.write(energyLevel === 0 ? '//\\\\' : '/||\\');
    log.moveCursor(0, -1);
  }
}
