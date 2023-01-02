import AbstractChallenge, { Answer } from '@app/abstract-challenge';

import { generateOrientationList, Orientation } from './orientation';
import Point3, { PointVector } from './point3';

type Scanner = {
  beacons: Point3[],
};

export default class Challenge extends AbstractChallenge {
  title = 'Beacon Scanner';

  scanners: Scanner[] = [];
  scannerPositions!: Point3[];

  orientationList!: Orientation[];

  init(): void {
    this.orientationList = generateOrientationList();

    let scanner: Scanner;
    this.input.split(/\r?\n/).forEach(line => {
      if (line.length === 0) {
        return;
      }

      if (line.startsWith('---')) {
        scanner = { beacons: [] };
        this.scanners.push(scanner);
        return;
      }

      scanner.beacons.push(new Point3(...line.split(',').map(x => parseInt(x)) as PointVector));
    });
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 392;
  solvePart1(): [string, Answer] {
    // Start with scanner 0, presuming it to be at (0, 0, 0) and default orientation (Forward=+Z / Up=+Y)
    const allBeacons = [...this.scanners[0].beacons];

    const scannersToSearch = [...this.scanners.slice(1)];

    this.scannerPositions = [new Point3(0, 0, 0)];

    for (let iScanner = 0; iScanner < scannersToSearch.length; iScanner++) {
      const scanner = scannersToSearch[iScanner];

      scannerLoop:
      for (const orientation of this.orientationList) {
        const rotatedBeacons = scanner.beacons.map(orientation.transform);

        for (const pA of allBeacons) {
          for (const pB of rotatedBeacons) {
            const delta = pA.clone().subtract(pB);

            const translatedBeacons = rotatedBeacons.map(p => p.clone().add(delta));

            const overlap = translatedBeacons.filter(p1 => allBeacons.some(p2 => p1.equals(p2)));

            if (overlap.length >= 12) {
              allBeacons.push(...translatedBeacons.filter(p => !overlap.includes(p)));

              this.scannerPositions.push(delta);

              // Remove this scanner from the search, push previously searched scanners to the end, and start over
              scannersToSearch.push(...scannersToSearch.splice(0, iScanner + 1));
              scannersToSearch.pop();
              iScanner = -1;

              console.log(`Scanner overlap found (${scannersToSearch.length} scanners remaining)`);
              break scannerLoop;
            }
          }
        }
      }
    }

    if (scannersToSearch.length > 0) {
      throw new Error('Failed to connect all scanners');
    }

    return ['There are {0} beacons in total', allBeacons.length];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 13332;
  solvePart2(): [string, Answer] {
    let maxDist = 0;

    for (let iA = 0; iA < this.scannerPositions.length; iA++) {
      for (let iB = 0; iB < this.scannerPositions.length; iB++) {
        if (iA === iB) continue;

        const a = this.scannerPositions[iA];
        const b = this.scannerPositions[iB];

        const dist = Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z);

        maxDist = Math.max(maxDist, dist);
      }
    }

    return ['The greatest taxi distance between scanners is ', maxDist];
  }
}
