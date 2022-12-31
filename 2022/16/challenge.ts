import AbstractChallenge, { Answer } from '@app/abstract-challenge';
import { pathfinder } from '@framework/pathfinder';

const START_TIME_PART_1 = 30;
const START_TIME_PART_2 = 26;

class Valve {
  name: string;
  rate: number;
  neighborNames: string[];

  constructor(data: string) {
    const [, name, rate, neighborList] = data.match(/Valve (..) has flow rate=(\d+); tunnels? leads? to valves? (.*)/)!;

    this.name = name;
    this.rate = parseInt(rate);
    this.neighborNames = neighborList.split(', ');
  }

  toString(): string { return this.name; }
}

type State = {
  currentValve: Valve,
  timeLeft: number,
  closedValves: Valve[],
  releasedPressure: number,
  withElephant: boolean,
};

export default class Challenge extends AbstractChallenge {
  title = 'Proboscidea Volcanium';

  valves!: Valve[];
  valveMap!: { [key: string]: Valve };
  activeValves!: Valve[];
  startValve!: Valve;

  distMap: { [key: string]: { [key: string]: number } } = { };

  init(): void {
    this.valves = this.input.split(/\r?\n/).map(line => new Valve(line));

    this.valveMap = this.valves.reduce((map, valve) => ({ ...map, [valve.name]: valve }), { });

    this.activeValves = this.valves.filter(valve => valve.rate > 0);

    this.startValve = this.valveMap['AA'];
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 1947;
  solvePart1(): [string, Answer] {
    // Build a map of the shortest distances from every active valve to the others (and from the start)
    const sourceValves = [this.startValve, ...this.activeValves];

    for (let i1 = 0; i1 < sourceValves.length; i1++) {
      const source = sourceValves[i1];
      for (let i2 = i1; i2 < this.activeValves.length; i2++) {
        const target = this.activeValves[i2];

        const dist = pathfinder.findPath(
          source,
          target,
          (valve: Valve): Valve[] => valve.neighborNames.map(name => this.valveMap[name]),
          (): number => 1,
          (): number => 0, // No heuristic (Djikstra's)
        ).length;

        this.distMap[source.name] = { ...this.distMap[source.name], [target.name]: dist };
        if (source.name !== 'AA') {
          this.distMap[target.name] = { ...this.distMap[target.name], [source.name]: dist };
        }
      }
    }

    const mostReleasedPressure = this.findBestPath(START_TIME_PART_1);

    return ['The most pressure that can be released in 30 minutes is ', mostReleasedPressure];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 2556;
  solvePart2(): [string, Answer] {
    const mostReleasedPressure = this.findBestPath(START_TIME_PART_2, true);

    return ['The most pressure that can be released in 26 minutes with help is ', mostReleasedPressure];
  }

  findBestPath(startTime: number, withElephant = false): number {
    const openSet = [{
      currentValve: this.startValve,
      timeLeft: startTime,
      closedValves: [...this.activeValves].sort((a, b) => a.rate - b.rate),
      releasedPressure: 0,
      withElephant,
    }];

    const minReleasedPressureMap = new Map([[buildStateKey(openSet[0]), 0]]);

    let mostReleasedPressure = 0;

    while (openSet.length > 0) {
      const current = openSet.pop()!;

      const currentKey = buildStateKey(current);
      const minReleasedPressure = minReleasedPressureMap.get(currentKey) ?? 0;

      // If we've reached the same state before with more pressure released, prune branch
      if (minReleasedPressure > current.releasedPressure) {
        continue;
      }

      minReleasedPressureMap.set(currentKey, current.releasedPressure);

      // If it's impossible to release more pressure than the current record, prune branch
      if (calculateMaxReleasedPressure(current) <= mostReleasedPressure) {
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

        openSet.push({
          currentValve: nextValve,
          timeLeft: nextTimeLeft,
          closedValves: current.closedValves.filter(valve => valve !== nextValve),
          releasedPressure: current.releasedPressure + (nextValve.rate * nextTimeLeft),
          withElephant: current.withElephant,
        });
      }

      // If the elephant is helping, we could stop and let it open the remaining valves
      if (current.withElephant) {
        openSet.push({
          currentValve: this.startValve,
          timeLeft: startTime,
          closedValves: current.closedValves,
          releasedPressure: current.releasedPressure,
          withElephant: false,
        });
      }
    }

    return mostReleasedPressure;
  }
}

function buildStateKey(state: State): string {
  return [
    state.currentValve.name,
    state.timeLeft,
    state.closedValves.map(valve => valve.name),
    state.withElephant,
  ].join();
}

function calculateMaxReleasedPressure(state: State): number {
  const sortedValveRates = state.closedValves.map(valve => valve.rate).sort((a, b) => b - a);

  if (!state.withElephant) {
    return state.releasedPressure + sortedValveRates.map((rate, i) => rate * Math.max(0, state.timeLeft - (2 * (i+1)))).reduce((a, b) => a + b);
  }

  return state.releasedPressure + sortedValveRates.reduce((a, b) => a + b) * (START_TIME_PART_2 - 2);
}
