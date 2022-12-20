const NONE = -1;
const ORE = 0;
const CLAY = 1;
const OBSIDIAN = 2;
const GEODE = 3;
const MATERIALS = [ORE, CLAY, OBSIDIAN, GEODE];

export const challenge = {
  title: 'Not Enough Minerals',

  init() {
    this.blueprints = this.input.split(/\r?\n/).map(line => ({
      robots: line.split(/[:.] /).slice(1).map(costData => ({
        cost: [
          parseInt(costData.match(/(\d+) ore/)?.[1] ?? 0),
          parseInt(costData.match(/(\d+) clay/)?.[1] ?? 0),
          parseInt(costData.match(/(\d+) obsidian/)?.[1] ?? 0),
          0 // No robot costs geodes to build
        ],
      }))
    }));
  },

  // --- Part 1 --- //
  part1ExpectedAnswer: 1306,
  solvePart1() {
    // console.log(simulateBlueprint(this.blueprints[0 % this.blueprints.length]));

    const maxGeodeCounts = this.blueprints.map((blueprint, i) => {
      console.log(`Simulating #${i+1}...`);
      return simulateBlueprint(blueprint, 24);
    });

    const qualityLevels = maxGeodeCounts.map((count, i) => (i + 1) * count);

    return ['The sum of all quality levels is ', qualityLevels.reduce((a, b) => a + b)];
  },

  // --- Part 2 --- //
  part2ExpectedAnswer: 37604,
  solvePart2() {
    const maxGeodeCounts = this.blueprints.slice(0, 3).map((blueprint, i) => {
      console.log(`Simulating #${i+1}...`);
      return simulateBlueprint(blueprint, 32);
    });

    return ['The product of the first 3 blueprints\' max geode counts is ', maxGeodeCounts.reduce((a, b) => a * b)];
  },
}

function simulateBlueprint(blueprint, timeLimit) {
  // Track the most successful path so far, discarding any that can't possibly exceed this
  let minGeodes = 0;

  const maximizeGeodes = function (robots, materials, skippedOptions, remainingMinutes, branchDepth = 0) {
    // --- PRUNE --- //
    if (remainingMinutes <= 1) {
      return materials[GEODE] + robots[GEODE] * remainingMinutes;
    }

    minGeodes = Math.max(minGeodes, materials[GEODE]);

    if (minGeodes > 0) {
      let maxGeodeRobots = remainingMinutes - 1;
      // TODO: This could be improved to account for how long it will take to build the first robot
      if (robots[OBSIDIAN] === 0) {
        maxGeodeRobots -= 2;
        if (robots[CLAY] === 0) {
          maxGeodeRobots -= 2;
        }
      }
      maxGeodeRobots = Math.max(0, maxGeodeRobots);
      const maxPotentialGeodes = materials[GEODE] + (robots[GEODE] * remainingMinutes) + ((maxGeodeRobots * (maxGeodeRobots+1) / 2));

      if (maxPotentialGeodes <= minGeodes) {
        return materials[GEODE];
      }
    }

    // --- BRANCH --- //
    const buildOptions = [];

    const canBuildNow = MATERIALS.filter(material => blueprint.robots[material].cost.every((x, i) => materials[i] >= x));
    // TODO: Prune options that there isn't enough time left to gather enough materials to build
    const canBuildLater = MATERIALS.filter(material => {
      const cost = blueprint.robots[material].cost;
      return cost.some((x, i) => materials[i] < x) && cost.every((x, i) => x === 0 || robots[i] > 0);
    });

    if (canBuildNow.length === 0) {
      buildOptions.push(NONE);
    } else {
      buildOptions.push(...canBuildNow.filter(option => !skippedOptions.includes(option)));

      if (canBuildLater.length > 0) {
        buildOptions.push(NONE);
      }
    }

    if (buildOptions.length === 0) {
      throw new Error(`No build options!`);
    }

    // --- RECURSE -- //

    return buildOptions.filter(option => !skippedOptions.includes(option)).map(option => {
      let nextRobots = [...robots];
      let nextMaterials = materials.map((x, i) => x + robots[i]);
      let nextSkippedOptions = [];

      if (option === NONE) {
        nextSkippedOptions = [...new Set([...skippedOptions, ...canBuildNow])];
      } else {
        nextRobots[option]++;
        nextMaterials = nextMaterials.map((x, i) => x - blueprint.robots[option].cost[i]);
      }

      return maximizeGeodes(nextRobots, nextMaterials, nextSkippedOptions, remainingMinutes - 1, branchDepth + (buildOptions.length > 1 ? 1 : 0));
    }).reduce((a, b) => Math.max(a, b));
  };

  return maximizeGeodes([1, 0, 0, 0], [0, 0, 0, 0], [], timeLimit);
}
