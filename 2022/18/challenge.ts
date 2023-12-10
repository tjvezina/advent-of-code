import AbstractChallenge, { Answer } from '@app/abstract-challenge';

type Coord = [number, number, number];

const NEIGHBOR_OFFSETS = [
  [-1,  0,  0],
  [ 1,  0,  0],
  [ 0, -1,  0],
  [ 0,  1,  0],
  [ 0,  0, -1],
  [ 0,  0,  1],
] as Coord[];

export default class Challenge extends AbstractChallenge {
  title = 'Boiling Boulders';

  cubeIDs!: Set<string>;
  cubes!: Coord[];

  init(): void {
    this.cubeIDs = new Set(this.input.split(/\r?\n/));
    this.cubes = [...this.cubeIDs].map(line => line.match(/(\d+),(\d+),(\d+)/)!.slice(1, 4).map(n => parseInt(n)) as Coord);
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 4482;
  solvePart1(): [string, Answer] {
    const surfaceAreaMap: { [key: string]: number } = { };

    for (const cube of this.cubes) {
      const neighborIDs = NEIGHBOR_OFFSETS
        .map(offset => cube.map((n, i) => n + offset[i]).join())
        .filter(neighborID => surfaceAreaMap[neighborID] !== undefined);

      surfaceAreaMap[cube.join()] = 6 - neighborIDs.length;

      neighborIDs.forEach(neighborID => surfaceAreaMap[neighborID]--);
    }

    const surfaceArea = Object.values(surfaceAreaMap).reduce((a, b) => a + b);

    return ['The total surface area is ', surfaceArea];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 2576;
  solvePart2(): [string, Answer] {
    let min = new Array(3).fill(Infinity) as Coord;
    let max = new Array(3).fill(-Infinity) as Coord;

    for (const cube of this.cubes) {
      for (let i = 0; i < 3; i++) {
        min[i] = Math.min(min[i], cube[i]);
        max[i] = Math.max(max[i], cube[i]);
      }
    }

    min = min.map(n => n - 1) as Coord;
    max = max.map(n => n + 1) as Coord;

    const start = [...min] as Coord;
    const outsideIDs = new Set(start.join());
    const openSet = [start];

    while (openSet.length > 0) {
      const coord = openSet.shift()!;
      const neighbors = NEIGHBOR_OFFSETS
        .map(offset => coord.map((n, i) => n + offset[i]) as Coord)
        .filter(neighborCoord => neighborCoord.every((n, i) => n >= min[i] && n <= max[i]))
        .map(neighborCoord => ({ coord: neighborCoord, id: neighborCoord.join() }))
        .filter(neighbor => !outsideIDs.has(neighbor.id) && !this.cubeIDs.has(neighbor.id));

      neighbors.forEach(neighbor => {
        outsideIDs.add(neighbor.id);
        openSet.push(neighbor.coord);
      });
    }

    const surfaceArea = this.cubes.map(cube => {
      return NEIGHBOR_OFFSETS.map(offset => cube.map((n, i) => n + offset[i]).join()).filter(id => outsideIDs.has(id)).length;
    }).reduce((a, b) => a + b);

    return ['The exterior surface area is ', surfaceArea];
  }
}
