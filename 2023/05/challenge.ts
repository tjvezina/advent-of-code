import AbstractChallenge, { Answer } from '@app/abstract-challenge';

const VALUE_TYPES = ['soil', 'fertilizer', 'water', 'light', 'temperature', 'humidity', 'location'] as const;
type ValueType = typeof VALUE_TYPES[number];

type ValueMap = {
  sourceStart: number,
  destStart: number,
  rangeLength: number,
}

export default class Challenge extends AbstractChallenge {
  title = 'If You Give A Seed A Fertilizer';

  seeds!: number[];

  valueMapSets!: Record<Exclude<ValueType, 'seed'>, ValueMap[]>;

  init(): void {
    const inputParts = this.input.split(/(?:\r?\n){2}/);

    const seedStr = inputParts.shift()!;
    this.seeds = [...seedStr.split(': ')[1].matchAll(/\d+/g)].map(match => parseInt(match[0]));

    const valueMapSets: Partial<typeof this.valueMapSets> = {};

    for (const valueType of VALUE_TYPES) {
      const mapStr = inputParts.shift()!;
      const lines = mapStr.split(/\r?\n/);

      valueMapSets[valueType] = lines.slice(1).map(line => {
        const [destStart, sourceStart, rangeLength] = [...line.matchAll(/\d+/g)].map(match => parseInt(match[0]));
        return { destStart, sourceStart, rangeLength };
      });
    }

    this.valueMapSets = valueMapSets as Required<typeof valueMapSets>;
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 389056265;
  solvePart1(): [string, Answer] {
    const locations = this.seeds.map(this.mapSeedToLocation.bind(this));

    const nearestLocation = locations.reduce((nearest, location) => Math.min(nearest, location));
    return ['The nearest planting location is at ', nearestLocation];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 137516820;
  solvePart2(): [string, Answer] {
    let focusValues: number[] = [];

    // Collect the boundary values of each map set, and revese-map them to get a set of seed values worth focusing on
    for (const valueType of [...VALUE_TYPES].reverse()) {
      const valueMapSet = this.valueMapSets[valueType];

      focusValues = focusValues.map(value => {
        for (const map of valueMapSet) {
          if (value >= map.destStart && value < map.destStart + map.rangeLength) {
            return value + (map.sourceStart - map.destStart);
          }
        }
        return value;
      });

      const mapBoundaries = valueMapSet.flatMap(map => [map.sourceStart, map.sourceStart + map.rangeLength]);

      for (const boundary of mapBoundaries) {
        if (!focusValues.includes(boundary)) {
          focusValues.push(boundary);
        }
      }
    }

    focusValues.sort();

    const seedValues: number[] = [];

    // For each seed range, collect the relevant focus values to greatly reduce the number of values we need to check
    for (let i = 0; i < this.seeds.length; i += 2) {
      const [start, rangeLength] = this.seeds.slice(i, i + 2);

      seedValues.push(start);
      seedValues.push(...focusValues.filter(value => value > start && value < start + rangeLength));
    }

    const locations = seedValues.map(this.mapSeedToLocation.bind(this));

    const nearestLocation = locations.reduce((nearest, location) => Math.min(nearest, location));
    return ['The nearest planting location is at ', nearestLocation];
  }

  mapSeedToLocation(seed: number): number {
    let value = seed;
    for (const valueType of VALUE_TYPES) {
      for (const map of this.valueMapSets[valueType]) {
        if (value >= map.sourceStart && value < map.sourceStart + map.rangeLength) {
          value += (map.destStart - map.sourceStart);
          break;
        }
      }
    }
    return value;
  }
}
