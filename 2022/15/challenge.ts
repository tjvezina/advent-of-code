import AbstractChallenge, { Answer } from '@app/abstract-challenge';
import Point from '@framework/geometry/point';

const FIRST_ROW = 2_000_000;

type Sensor = {
  pos: Point,
  nearestBeacon: Point,
};

export default class Challenge extends AbstractChallenge {
  title = 'Beacon Exclusion Zone';

  beacons: Point[] = [];
  sensors: Sensor[] = [];

  init(): void {
    this.input.split(/\r?\n/).forEach(line => {
      const [sx, sy, bx, by] = line.match(/Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/)!
        .slice(1, 5).map(x => parseInt(x));

      const beacon = new Point(bx, by);

      if (!this.beacons.some(other => other.equals(beacon))) {
        this.beacons.push(beacon);
      }

      this.sensors.push({ pos: new Point(sx, sy), nearestBeacon: beacon });
    });
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 4748135;
  solvePart1(): [string, Answer] {
    const invalidRanges = this.checkRow(FIRST_ROW);

    const rowBeacons = this.beacons.filter(beacon => beacon.y === FIRST_ROW);

    const invalidCount = invalidRanges.map(range => {
      const containedBeacons = rowBeacons.filter(beacon => beacon.x >= range[0] && beacon.x <= range[1]);
      return (range[1] - range[0] + 1) - containedBeacons.length;
    }).reduce((a, b) => a + b);

    return [`There are {0} positions in row ${FIRST_ROW} that cannot contain a beacon`, invalidCount];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 13743542639657;
  solvePart2(): [string, Answer] {
    const diamonds = this.sensors.map(sensor => ({
      center: sensor.pos,
      radius: Point.getTaxiDist(sensor.pos, sensor.nearestBeacon) + 1,
    }));

    const tangentPairs = diamonds.map((diamond, i) => [diamond, ...diamonds.slice(i+1)
      .filter(other => Point.getTaxiDist(diamond.center, other.center) === diamond.radius + other.radius)],
    ).filter(pair => pair.length >= 2);

    if (tangentPairs.length < 2) throw new Error('Failed to find two tangent sensor pairs, unable to solve');
    if (tangentPairs.length > 2) throw new Error('Found too many tangent sensor pairs, not supported');

    const [a, b, c, d] = tangentPairs.flatMap(x => x);

    const p1 = new Point(a.center.x + Math.sign(b.center.x - a.center.x) * a.radius, a.center.y);
    const p2 = new Point(a.center.x, a.center.y + Math.sign(b.center.y - a.center.y) * a.radius);
    const p3 = new Point(c.center.x + Math.sign(d.center.x - c.center.x) * c.radius, c.center.y);
    const p4 = new Point(c.center.x, c.center.y + Math.sign(d.center.y - c.center.y) * c.radius);

    const denominator = (p1.x - p2.x)*(p3.y - p4.y) - (p1.y - p2.y)*(p3.x - p4.x);
    let bx = ((p1.x*p2.y - p1.y*p2.x)*(p3.x - p4.x) - (p1.x - p2.x)*(p3.x*p4.y - p3.y*p4.x)) / denominator;
    let by = ((p1.x*p2.y - p1.y*p2.x)*(p3.y - p4.y) - (p1.y - p2.y)*(p3.x*p4.y - p3.y*p4.x)) / denominator;

    // Resolve floating point imprecision
    bx = Math.round(bx);
    by = Math.round(by);

    return [`The distress beacon must be at (${bx}, ${by}) with frequency `, (bx * 2*FIRST_ROW) + by];
  }

  checkRow(row: number): number[][] {
    const invalidRanges = [];

    for (const sensor of this.sensors) {
      const rowCoverage = Point.getTaxiDist(sensor.pos, sensor.nearestBeacon) - Math.abs(sensor.pos.y - row);

      if (rowCoverage < 0) {
        continue;
      }

      const range = [sensor.pos.x - rowCoverage, sensor.pos.x + rowCoverage];

      for (let i = invalidRanges.length - 1; i >= 0; i--) {
        const other = invalidRanges[i];
        if (range[0] <= other[1] && range[1] >= other[0]) {
          range[0] = Math.min(other[0], range[0]);
          range[1] = Math.max(other[1], range[1]);
          invalidRanges.splice(i, 1);
        }
      }

      invalidRanges.push(range);
    }

    return invalidRanges;
  }
}
