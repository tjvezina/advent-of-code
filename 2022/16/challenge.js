import { pathfinder } from '../../framework/pathfinder.js';

const START_TIME_PART_1 = 30;
const START_TIME_PART_2 = 26;

class Valve {
  constructor(data) {
    const [, name, rate, neighborList] = data.match(/Valve (..) has flow rate=(\d+); tunnels? leads? to valves? (.*)/);

    this.name = name;
    this.rate = parseInt(rate);
    this.neighborNames = neighborList.split(', ');
  }

  toString() { return this.name; }
}

class State {
  constructor({ currentValve, timeLeft, closedValves, releasedPressure, withElephant }) {
    this.currentValve = currentValve;
    this.timeLeft = timeLeft;
    this.closedValves = closedValves;
    this.releasedPressure = releasedPressure;
    this.withElephant = withElephant;
  }

  buildKey() {
    return [
      this.currentValve.name,
      this.timeLeft,
      this.closedValves.map(valve => valve.name),
      this.withElephant,
    ].join();
  }

  calculateMaxReleasedPressure() {
    const sortedValveRates = this.closedValves.map(valve => valve.rate).sort((a, b) => b - a);

    if (!this.withElephant) {
      return this.releasedPressure + sortedValveRates.map((rate, i) => rate * Math.max(0, this.timeLeft - (2 * (i+1)))).reduce((a, b) => a + b);
    }

    return this.releasedPressure + sortedValveRates.reduce((a, b) => a + b) * (START_TIME_PART_2 - 2);
  }
}

export const challenge = {
  title: 'Proboscidea Volcanium',

  init() {
    this.valves = this.input.split(/\r?\n/).map(line => new Valve(line));

    this.valveMap = this.valves.reduce((map, valve) => ({ ...map, [valve.name]: valve }), { });
    
    this.activeValves = this.valves.filter(valve => valve.rate > 0);

    this.startValve = this.valveMap['AA'];
  },

  // --- Part 1 --- //
  part1ExpectedAnswer: 1947,
  solvePart1() {
    // Build a map of the shortest distances from every active valve to the others (and from the start)
    const sourceValves = [this.startValve, ...this.activeValves];
    this.distMap = { };
    for (let i1 = 0; i1 < sourceValves.length; i1++) {
      const source = sourceValves[i1];
      for (let i2 = i1; i2 < this.activeValves.length; i2++) {
        const target = this.activeValves[i2];

        const dist = pathfinder.findPath(
          source,
          target,
          ((valve) => valve.neighborNames.map(name => this.valveMap[name])).bind(this),
          () => 1,
          () => 0, // No heuristic (Djikstra's)
        ).length;

        this.distMap[source.name] = { ...this.distMap[source.name], [target.name]: dist };
        if (source.name !== 'AA') {
          this.distMap[target.name] = { ...this.distMap[target.name], [source.name]: dist };
        }
      }
    }

    const mostReleasedPressure = this.findBestPath(START_TIME_PART_1);

    return ['The most pressure that can be released in 30 minutes is ', mostReleasedPressure];
  },

  // --- Part 2 --- //
  part2ExpectedAnswer: 2556,
  solvePart2() {
    const mostReleasedPressure = this.findBestPath(START_TIME_PART_2, true);

    return ['The most pressure that can be released in 26 minutes with help is ', mostReleasedPressure];
  },

  findBestPath(startTime, withElephant = false) {
    const openSet = [new State({
      currentValve: this.startValve,
      timeLeft: startTime,
      closedValves: [...this.activeValves].sort((a, b) => a.rate - b.rate),
      releasedPressure: 0,
      withElephant,
    })];

    const minReleasedPressureMap = new Map([[openSet[0].key, 0]]);

    let mostReleasedPressure = 0;

    while (openSet.length > 0) {
      const current = openSet.pop();

      const currentKey = current.buildKey();
      const minReleasedPressure = minReleasedPressureMap.get(currentKey) ?? 0;

      // If we've reached the same state before with more pressure released, prune branch
      if (minReleasedPressure > current.releasedPressure) {
        continue;
      }

      minReleasedPressureMap.set(currentKey, current.releasedPressure);

      // If it's impossible to release more pressure than the current record, prune branch
      if (current.calculateMaxReleasedPressure() <= mostReleasedPressure) {
        continue;
      }

      mostReleasedPressure = Math.max(mostReleasedPressure, current.releasedPressure);

      for (const nextValve of current.closedValves) {
        const dist = this.distMap[current.currentValve.name][nextValve.name];

        // Not enough time to reach and open the valve
        if (dist + 1 >= current.timeLeft) {
          continue;
        }

        const nextTimeLeft = current.timeLeft - (dist + 1);

        openSet.push(new State({
          currentValve: nextValve,
          timeLeft: nextTimeLeft,
          closedValves: current.closedValves.filter(valve => valve !== nextValve),
          releasedPressure: current.releasedPressure + (nextValve.rate * nextTimeLeft),
          withElephant: current.withElephant,
        }));
      }

      // If the elephant is helping, we could stop and let it open the remaining valves
      if (current.withElephant) {
        openSet.push(new State({
          currentValve: this.startValve,
          timeLeft: startTime,
          closedValves: current.closedValves,
          releasedPressure: current.releasedPressure,
          withElephant: false,
        }));
      }
    }

    return mostReleasedPressure;
  },
}
