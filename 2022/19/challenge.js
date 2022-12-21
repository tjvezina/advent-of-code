import { log } from '../../framework/console-util.js';

class State {
  constructor(robots, materials, timeLeft) {
    Object.assign(this, { robots, materials, timeLeft });
  }

  clone() {
    return new State([...this.robots], [...this.materials], this.timeLeft);
  }
}

const ORE = 0;
const CLAY = 1;
const OBSIDIAN = 2;
const GEODE = 3;
const MATERIALS = [ORE, CLAY, OBSIDIAN, GEODE];

const MIN_USE_TIME = [1, 3, 1, 0]; // Minimum time required to make use of a material
const MIN_BUILD_TIME = [3, 5, 3, 1]; // Minimum time required to build a useful robot

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
    const maxGeodeCounts = this.blueprints.map((blueprint, i) => {
      log.write(`Simulating #${i+1}... `);
      const maxGeodes = simulateBlueprint(blueprint, 24);
      log.writeLine(maxGeodes);
      return maxGeodes;
    });

    const qualityLevels = maxGeodeCounts.map((count, i) => (i + 1) * count);

    return ['The sum of all quality levels is ', qualityLevels.reduce((a, b) => a + b)];
  },

  // --- Part 2 --- //
  part2ExpectedAnswer: 37604,
  solvePart2() {
    const maxGeodeCounts = this.blueprints.slice(0, 3).map((blueprint, i) => {
      log.write(`Simulating #${i+1}... `);
      const maxGeodes = simulateBlueprint(blueprint, 32);
      log.writeLine(maxGeodes);
      return maxGeodes;
    });

    return ['The product of the first 3 blueprints\' max geode counts is ', maxGeodeCounts.reduce((a, b) => a * b)];
  },
}

function simulateBlueprint(blueprint, startTime) {
  const openSet = [new State([1, 0, 0, 0], [0, 0, 0, 0], startTime)];

  // Track the most geodes produces by a path, and discard any that can't possibly exceed this
  let bestGeodeCount = 0;

  // The minimum time it can take to build the first robot, starting from the preceeding type
  const minGeodeBuildTime = 1 + Math.ceil((Math.sqrt(8*blueprint.robots[GEODE].cost[OBSIDIAN] + 1) - 1) / 2);
  const minObsidianBuildTime = 1 + Math.ceil((Math.sqrt(8*blueprint.robots[OBSIDIAN].cost[CLAY] + 1) - 1) / 2);

  const maxCosts = MATERIALS.map(material => blueprint.robots.map(robot => robot.cost[material]).reduce((a, b) => a > b ? a : b));

  while (openSet.length > 0) {
    const current = openSet.pop();

    const minGeodes = current.materials[GEODE] + current.robots[GEODE] * current.timeLeft;

    bestGeodeCount = Math.max(bestGeodeCount, minGeodes);

    // No time to build more robots
    if (current.timeLeft <= 1) {
      continue;
    }

    // If there are enough materials to simply build geode robots every minute until the last, ignore other paths
    if (blueprint.robots[GEODE].cost.every((x, i) => {
      return x === 0 || (current.materials[i] >= x && current.materials[i] + current.robots[i] * (current.timeLeft - 2) >= x * (current.timeLeft - 1));
    })) {
      const additionalGeodeRobots = current.timeLeft - 1;
      const geodeCount = minGeodes + ((additionalGeodeRobots * (additionalGeodeRobots + 1) / 2));

      bestGeodeCount = Math.max(bestGeodeCount, geodeCount);
      continue;
    }

    // If there's no way to make more geodes than the current record (even with a new geode robot every minute), ignore
    if (bestGeodeCount > 0) {
      let maxAdditionalGeodeRobots = current.timeLeft - 1;
      if (current.robots[OBSIDIAN] === 0) {
        maxAdditionalGeodeRobots -= minGeodeBuildTime;
        if (current.robots[CLAY] === 0) {
          maxAdditionalGeodeRobots -= minObsidianBuildTime;
        }
      }
      maxAdditionalGeodeRobots = Math.max(0, maxAdditionalGeodeRobots);
      const maxPotentialGeodes = minGeodes + ((maxAdditionalGeodeRobots * (maxAdditionalGeodeRobots + 1) / 2));

      if (maxPotentialGeodes <= bestGeodeCount) {
        continue;
      }
    }

    // With 2 or 3 minutes left, only Geode robots are worth building
    // With 4 or 5 minutes left, only Geode robots, or the robots that contribute directly to building Geode robots, are worth building
    const buildOptions = (current.timeLeft <= 3 ? [GEODE] : (current.timeLeft <= 5 ? [GEODE, OBSIDIAN, ORE] : [GEODE, OBSIDIAN, CLAY, ORE]));

    for (const robotType of buildOptions) {
      const robotCost = blueprint.robots[robotType].cost;

      // If building is not possible with the current set of robots, ignore
      if (robotCost.some((x, i) => x > 0 && current.robots[i] === 0)) {
        continue;
      }

      if (robotType !== GEODE) {
        // Materials are only useful up to a certain point (ex. building obsidian robots from clay is useless with < 3 minutes left)
        const usefulTime = (current.timeLeft - MIN_USE_TIME[robotType]);

        const minMaterial = current.materials[robotType] + current.robots[robotType] * usefulTime;
        
        const maxNeeded = maxCosts[robotType] * usefulTime;
        
        // If we already have more of a material than we could possibly build with, don't build more of that robot
        if (minMaterial >= maxNeeded) {
          continue;
        }
      }

      // Determine how long we have to wait before we have enough materials to build with
      const timeToBuild = 1 + robotCost.map((x, i) => Math.ceil(Math.max(0, x - current.materials[i]) / (current.robots[i] || 1)))
        .reduce((a, b) => a > b ? a : b);

      // If there's not enough time to build (and use) the robot, ignore
      if (timeToBuild > current.timeLeft - MIN_BUILD_TIME[robotType]) {
        continue;
      }

      const next = current.clone();

      // Wait until we have enough materials to build, then subtract the build cost
      next.materials = next.materials.map((x, i) => x + (timeToBuild * next.robots[i]) - robotCost[i]);
      next.robots[robotType]++;
      next.timeLeft -= timeToBuild;

      openSet.push(next);
    }
  }

  return bestGeodeCount;
}