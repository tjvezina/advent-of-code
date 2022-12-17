import { pathfinder } from '../../framework/pathfinder.js';

class Valve {
  constructor(data) {
    const [, name, rate, neighborList] = data.match(/Valve (..) has flow rate=(\d+); tunnels? leads? to valves? (.*)/);

    this.name = name;
    this.rate = parseInt(rate);
    this.neighborNames = neighborList.split(', ');
  }

  toString() { return this.name; }
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

    // Floyd–Warshall Algorithm - barely improved performance, leaving out for now
    // const valveNames = this.valves.map(valve => valve.name);
    // this.distMap = new Map(valveNames.map(sourceName => [
    //   sourceName,
    //   new Map(valveNames.map(targetName => [
    //     targetName,
    //     sourceName === targetName ? 0 : (this.valveMap[sourceName].neighborNames.includes(targetName) ? 1 : Number.MAX_SAFE_INTEGER)
    //   ]))
    // ]));
    // valveNames.forEach(name1 => {
    //   valveNames.forEach(name2 => {
    //     valveNames.forEach(name3 => {
    //       this.distMap.get(name2).set(name3, Math.min(
    //         this.distMap.get(name2).get(name3),
    //         this.distMap.get(name2).get(name1) + this.distMap.get(name1).get(name3),
    //       ));
    //     });
    //   });
    // });

    const mostReleasedPressure = this.findBestPath(30);

    return ['The most pressure that can be released in 30 minutes is ', mostReleasedPressure];
  },

  // --- Part 2 --- //
  part2ExpectedAnswer: 2556,
  solvePart2() {
    const mostReleasedPressure = this.findBestPath(26, true);

    return ['The most pressure that can be released in 26 minutes with help is ', mostReleasedPressure];
  },

  findBestPath(startMinutes, withElephant = false) {
    const memoizedDFS = memoize((currentValve, remainingMinutes, closedValves, withElephant = false) => {
      let mostReleasedPressure = 0;

      for (const nextValve of closedValves) {
        const dist = this.distMap[currentValve.name][nextValve.name];
        
        if (dist + 1 >= remainingMinutes) {
          continue;
        }
        
        let nextRemainingMinutes = remainingMinutes - (dist + 1);
        const releasedPressure = (nextValve.rate * nextRemainingMinutes)
          + memoizedDFS(nextValve, nextRemainingMinutes, closedValves.filter(valve => valve !== nextValve), withElephant);

        mostReleasedPressure = Math.max(mostReleasedPressure, releasedPressure);
      }

      if (withElephant) {
        mostReleasedPressure = Math.max(mostReleasedPressure, memoizedDFS(this.startValve, startMinutes, closedValves));
      }

      return mostReleasedPressure;
    });

    return memoizedDFS(this.startValve, startMinutes, [...this.activeValves], withElephant);
  },
}

function memoize(func) {
  const cache = new Map();

  return (...args) => {
    const key = args.join();

    if (!cache.has(key)) {
      cache.set(key, func(...args));
    }

    return cache.get(key);
  };
}