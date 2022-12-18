const NEIGHBOR_OFFSETS = [
  [-1,  0,  0],
  [ 1,  0,  0],
  [ 0, -1,  0],
  [ 0,  1,  0],
  [ 0,  0, -1],
  [ 0,  0,  1],
];

export const challenge = {
  title: 'Boiling Boulders',

  init() {
    this.cubeIDs = new Set(this.input.split(/\r?\n/));
    this.cubes = [...this.cubeIDs].map(line => line.match(/(\d+),(\d+),(\d+)/).slice(1, 4).map(n => parseInt(n)));
  },

  // --- Part 1 --- //
  part1ExpectedAnswer: 4482,
  solvePart1() {
    const surfaceAreaMap = { };

    for (const cube of this.cubes) {
      const neighborIDs = NEIGHBOR_OFFSETS
        .map(offset => cube.map((n, i) => n + offset[i]).join())
        .filter(neighborID => surfaceAreaMap[neighborID] !== undefined);

      surfaceAreaMap[cube.join()] = 6 - neighborIDs.length;

      neighborIDs.forEach(neighborID => surfaceAreaMap[neighborID]--);
    }

    const surfaceArea = Object.values(surfaceAreaMap).reduce((a, b) => a + b);

    return ['The total surface area is ', surfaceArea];
  },

  // --- Part 2 --- //
  part2ExpectedAnswer: 2576,
  solvePart2() {
    let min = new Array(3).fill(Infinity);
    let max = new Array(3).fill(-Infinity);

    for (const cube of this.cubes) {
      for (let i = 0; i < 3; i++) {
        min[i] = Math.min(min[i], cube[i]);
        max[i] = Math.max(max[i], cube[i]);
      }
    }

    min = min.map(n => n - 1);
    max = max.map(n => n + 1);

    let start = [...min];
    const outsideIDs = new Set(start.join());
    let openSet = [start];

    while (openSet.length > 0) {
      const pos = openSet.shift();
      const neighbors = NEIGHBOR_OFFSETS
        .map(offset => pos.map((n, i) => n + offset[i]))
        .filter(neighborPos => neighborPos.every((n, i) => n >= min[i] && n <= max[i]))
        .map(neighborPos => ({ pos: neighborPos, id: neighborPos.join() }))
        .filter(neighbor => !outsideIDs.has(neighbor.id) && !this.cubeIDs.has(neighbor.id));
      
      neighbors.forEach(neighbor => {
        outsideIDs.add(neighbor.id);
        openSet.push(neighbor.pos);
      });
    }

    const surfaceArea = this.cubes.map(cube => {
      return NEIGHBOR_OFFSETS.map(offset => cube.map((n, i) => n + offset[i]).join()).filter(id => outsideIDs.has(id)).length;
    }).reduce((a, b) => a + b);

    return ['The exterior surface area is ', surfaceArea];
  },
}