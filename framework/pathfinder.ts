import Point from '@framework/geometry/point';
import Heap from '@framework/heap';

type GetDFunc<T> = (a: T, b: T) => number;
type GetHFunc<T> = (p: T, end: T) => number;
type GetNeighborsFunc<T> = (p: T) => T[];

function gridLength(): number { return 1; }
function gridHeuristic(p: Point, end: Point): number { return Point.getTaxiDist(p, end); }

const Pathfinder = {
  findPathInGrid(start: Point, end: Point, getNeighbors: GetNeighborsFunc<Point>, getD?: GetDFunc<Point>): Point[] {
    return this.findPath(start, end, getNeighbors, getD ?? gridLength, gridHeuristic);
  },

  findPath<T>(
    start: T,
    end: T,
    getNeighbors: GetNeighborsFunc<T>,
    getD: GetDFunc<T>,
    getH: GetHFunc<T>,
  ): T[] {
    const path = this.tryFindPath(start, end, getNeighbors, getD, getH);
    if (path === null) {
      throw new Error(`Failed to find path from ${start} to ${end}`);
    }
    return path;
  },

  tryFindPathInGrid(start: Point, end: Point, getNeighbors: GetNeighborsFunc<Point>, getD?: GetDFunc<Point>): Point[] | null {
    return this.tryFindPath(start, end, getNeighbors, getD ?? gridLength, gridHeuristic);
  },

  /*
    This is an implementation of A* pathfinding
    Definitions:
      - D: The length of an edge between two nodes (ex. in a grid, this is always 1)
      - G: The cost of moving from one node to another (ex. start -> current)
      - H: The heuristic score, estimating the cost of moving from one node to another (ex. current -> end)
      - F: The sum of G and H, i.e. the estimated total cost of a given path from start to end
  */
  tryFindPath<T>(
    start: T,
    end: T,
    getNeighbors: GetNeighborsFunc<T>,
    getD: GetDFunc<T>,
    getH: GetHFunc<T>,
  ): T[] | null {
    const gMap = new Map<T, number>([[start, 0]]);
    const fMap = new Map<T, number>([[start, getH(start, end)]]);

    const getG = (node: T): number => gMap.get(node) ?? Number.MAX_VALUE;
    const getF = (node: T): number => fMap.get(node) ?? Number.MAX_VALUE;

    const openSet = Heap.createMinHeap(getF);
    openSet.insert(start);
    const parentMap = new Map<T, T>();

    while (openSet.size > 0) {
      const current = openSet.extract()!;

      if (current === end) {
        const path = [];
        let node = current;
        while (parentMap.has(node)) {
          path.push(node);
          node = parentMap.get(node)!;
        }
        return path.reverse();
      }

      const neighbors = getNeighbors(current);

      if (parentMap.has(current)) {
        neighbors.splice(neighbors.indexOf(parentMap.get(current)!), 1);
      }

      for (const neighbor of neighbors) {
        const gNext = getG(current) + getD(current, neighbor);

        if (gNext < getG(neighbor)) {
          gMap.set(neighbor, gNext);
          fMap.set(neighbor, gNext + getH(neighbor, end));
          parentMap.set(neighbor, current);
          if (!openSet.includes(neighbor)) {
            openSet.insert(neighbor);
          }
        }
      }
    }

    return null;
  },
};
export default Pathfinder;
