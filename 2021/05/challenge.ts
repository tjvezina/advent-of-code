import AbstractChallenge, { Answer } from '@app/abstract-challenge';
import Line from '@framework/geometry/line';
import Point from '@framework/geometry/point';

export default class Challenge extends AbstractChallenge {
  title = 'Hydrothermal Venture';

  lines!: Line[];

  init(): void {
    this.lines = this.input.split(/\r?\n/).map(line =>
      new Line(...line.match(/\d+/g)!.map(x => parseInt(x)) as [number, number, number, number]),
    );
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 4728;
  solvePart1(): [string, Answer] {
    const ventMap = this.createVentMap(this.lines.filter(line => line.isAxisAligned()));

    const overlappingVents = [...ventMap.values()].filter(length => length > 1);

    return ['Axis-aligned vent lines overlap in {0} places', overlappingVents.length];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 17717;
  solvePart2(): [string, Answer] {
    const ventMap = this.createVentMap(this.lines);

    const overlappingVents = [...ventMap.values()].filter(length => length > 1);

    return ['All vent lines overlap in {0} places', overlappingVents.length];
  }

  createVentMap(lines: Line[]): Map<string, number> {
    const ventMap = new Map();

    const addPoint = function (point: Point): void {
      const key = point.toString();
      ventMap.set(key, (ventMap.get(key) ?? 0) + 1);
    };

    for (const line of lines) {
      const { start, end } = line;

      const point = start.clone();
      addPoint(point);

      while (!point.equals(end)) {
        point.x += Math.sign(end.x - start.x);
        point.y += Math.sign(end.y - start.y);

        addPoint(point);
      }
    }

    return ventMap;
  }
}
