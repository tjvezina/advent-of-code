import AbstractChallenge, { Answer } from '@app/abstract-challenge';
import CoordSystem from '@framework/geometry/coord-system';
import Direction from '@framework/geometry/direction';
import Point from '@framework/geometry/point';

type Beam = {
  pos: Point,
  dir: Direction,
}

export default class Challenge extends AbstractChallenge {
  title = 'The Floor Will Be Lava';

  grid!: string[];
  width!: number;
  height!: number;

  init(): void {
    CoordSystem.setActive(CoordSystem.YDown);

    this.grid = this.input.split(/\r?\n/);
    this.width = this.grid[0].length;
    this.height = this.grid.length;
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 7996;
  solvePart1(): [string, Answer] {
    const energizedTileCount = this.countEnergizedCells({ pos: new Point(-1, 0), dir: Direction.Right });

    return ['A total of {0} cells are energized', energizedTileCount];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 8239;
  solvePart2(): [string, Answer] {
    const startBeamList: Beam[] = [];
    for (let x = 0; x < this.width; x++) {
      startBeamList.push({ pos: new Point(x, -1), dir: Direction.Down });
      startBeamList.push({ pos: new Point(x, this.height), dir: Direction.Up });
    }
    for (let y = 0; y < this.height; y++) {
      startBeamList.push({ pos: new Point(-1, y), dir: Direction.Right });
      startBeamList.push({ pos: new Point(this.width, y), dir: Direction.Left });
    }

    const maxEnergizedCells = startBeamList.map(beam => this.countEnergizedCells(beam)).reduce((a, b) => Math.max(a, b));

    return ['The most possible energized cells are ', maxEnergizedCells];
  }

  isInBounds(beam: Beam): boolean {
    const { x, y } = beam.pos;
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  countEnergizedCells(startBeam: Beam): number {
    const directionHistory = new Array(this.height).fill(undefined).map(() =>
      new Array(this.width).fill(undefined).map(() =>
        new Array<Direction>(),
      ),
    );

    const beams: Beam[] = [startBeam];

    while (beams.length > 0) {
      const beam = beams.shift()!;

      do {
        beam.pos.move(beam.dir);

        if (!this.isInBounds(beam)) {
          break;
        }

        const tileHistory = directionHistory[beam.pos.y][beam.pos.x];
        if (tileHistory.includes(beam.dir)) {
          break;
        }
        tileHistory.push(beam.dir);

        const tile = this.grid[beam.pos.y][beam.pos.x];

        if (tile === '/') {
          if (Direction.isHorizontal(beam.dir)) {
            beam.dir = Direction.rotateCCW(beam.dir);
          } else {
            beam.dir = Direction.rotateCW(beam.dir);
          }
        } else if (tile === '\\') {
          if (Direction.isHorizontal(beam.dir)) {
            beam.dir = Direction.rotateCW(beam.dir);
          } else {
            beam.dir = Direction.rotateCCW(beam.dir);
          }
        } else if (tile === '-' || tile === '|') {
          if ((tile === '-') === Direction.isVertical(beam.dir)) {
            beams.push({ pos: beam.pos.clone(), dir: Direction.rotateCCW(beam.dir) });
            beam.dir = Direction.rotateCW(beam.dir);
          }
        }
      } while (true);
    }

    return directionHistory.map(row => row.filter(x => x.length > 0).length).reduce((a, b) => a + b);
  }
}
