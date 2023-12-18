import AbstractChallenge, { Answer } from '@app/abstract-challenge';
import Point from '@framework/geometry/point';
import Pathfinder from '@framework/pathfinder';

type Cell = {
  point: Point,
  risk: number,
};

export default class Challenge extends AbstractChallenge {
  title = 'Chiton';

  grid!: Cell[][];
  width!: number;
  height!: number;

  init(): void {
    this.grid = this.input.split(/\r?\n/).map((line, y) => [...line].map((risk, x) => ({ point: new Point(x, y), risk: parseInt(risk) }) as Cell));
    this.height = this.grid.length;
    this.width = this.grid[0].length;
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 824;
  solvePart1(): [string, Answer] {
    const { grid, height, width } = this;

    const getNeighbors = ({ x, y }: Point): Point[] => {
      return [
        (x > 0        ? grid[y][x-1].point : undefined),
        (y > 0        ? grid[y-1][x].point : undefined),
        (x < width-1  ? grid[y][x+1].point : undefined),
        (y < height-1 ? grid[y+1][x].point : undefined),
      ].filter(x => x !== undefined) as Point[];
    };

    // The "length" of a line between two nodes is represented by the destination's risk, i.e. moving to a '6' cell costs 6
    const getD = (_: Point, b: Point): number => grid[b.y][b.x].risk;
    const start = grid[0][0].point;
    const end = grid[height-1][width-1].point;

    const path = Pathfinder.findPathInGrid(start, end, getNeighbors, getD);

    const totalRisk = path.reduce((total, p) => total + grid[p.y][p.x].risk, 0);

    return ['The risk level of the safest path is ', totalRisk];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 3063;
  solvePart2(): [string, Answer] {
    const { grid, height, width } = this;
    const fullHeight = height * 5;
    const fullWidth = width * 5;

    const fullGrid = new Array(fullHeight).fill(undefined).map(() => new Array(fullWidth) as Cell[]);

    for (let y = 0; y < fullHeight; y++) {
      const row = fullGrid[y];
      for (let x = 0; x < fullWidth; x++) {
        row[x] = { point: new Point(x, y), risk: ((grid[y%height][x%width].risk + Math.floor(x/width) + Math.floor(y/height)) - 1) % 9 + 1 };
      }
    }

    const getNeighbors = ({ x, y }: Point): Point[] => {
      return [
        (x > 0            ? fullGrid[y][x-1].point : undefined),
        (y > 0            ? fullGrid[y-1][x].point : undefined),
        (x < fullWidth-1  ? fullGrid[y][x+1].point : undefined),
        (y < fullHeight-1 ? fullGrid[y+1][x].point : undefined),
      ].filter(x => x !== undefined) as Point[];
    };
    const getD = (_: Point, b: Point): number => fullGrid[b.y][b.x].risk;
    const start = fullGrid[0][0].point;
    const end = fullGrid[fullHeight-1][fullWidth-1].point;

    const path = Pathfinder.findPathInGrid(start, end, getNeighbors, getD);

    const totalRisk = path.reduce((total, p) => total + fullGrid[p.y][p.x].risk, 0);

    return ['The risk level of the safest path in the full grid is ', totalRisk];
  }
}
