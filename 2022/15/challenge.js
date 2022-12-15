import { Point } from '../../framework/geometry.js';

const FIRST_ROW = 2000000;

export const challenge = {
  title: 'Beacon Exclusion Zone',

  init() {
    this.sensors = [];
    this.beacons = [];

    this.input.split(/\r?\n/).map(line => {
      const [sx, sy, bx, by] = line.match(/Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/)
        .slice(1, 5).map(x => parseInt(x));

      const beacon = new Point(bx, by);

      if (!this.beacons.some(other => other.equals(beacon))) {
        this.beacons.push(beacon);
      }

      this.sensors.push({ pos: new Point(sx, sy), nearestBeacon: beacon });
    });
  },

  // --- Part 1 --- //
  part1ExpectedAnswer: 4748135,
  solvePart1() {
    const invalidRanges = this.checkRow(FIRST_ROW);

    const rowBeacons = this.beacons.filter(beacon => beacon.y === FIRST_ROW);

    const invalidCount = invalidRanges.map(range => {
      const containedBeacons = rowBeacons.filter(beacon => beacon.x >= range[0] && beacon.x <= range[1]);
      return (range[1] - range[0] + 1) - containedBeacons.length;
    }).reduce((a, b) => a + b);

    return [`There are {0} positions in row ${FIRST_ROW} that cannot contain a beacon`, invalidCount];
  },

  // --- Part 2 --- //
  part2ExpectedAnswer: 13743542639657,
  solvePart2() {
    for (let rowOffset = 1; rowOffset <= FIRST_ROW; rowOffset++) {
      for (const row of [FIRST_ROW - rowOffset, FIRST_ROW + rowOffset]) {
        const invalidRanges = this.checkRow(row).sort((a, b) => a[0] - b[0]);
        
        if (invalidRanges.length > 1 && invalidRanges[0][1] < invalidRanges[1][0] - 1) {
          const col = invalidRanges[0][1] + 1;
          if (col >= 0 && col < FIRST_ROW * 2) {
            return [`The distress beacon must be at ${col}, ${row} with frequency `, (col * (2*FIRST_ROW) + row)];
          }
        }
      }
    }

    throw new Error('Failed to find location of the distress beacon');
  },

  checkRow(row) {
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
  },
}