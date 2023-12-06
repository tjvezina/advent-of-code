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
    const locations = this.seeds.map(seed => {
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
    });

    const nearestLocation = locations.reduce((nearest, location) => Math.min(nearest, location));
    return ['The nearest planting location is at ', nearestLocation];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = null;
  solvePart2(): [string, Answer] {
    return ['', null];
  }
}
