class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return `${this.x},${this.y}`;
  }

  equals(other) {
    return Object.getPrototypeOf(other) === Point.prototype && this.x === other.x && this.y === other.y;
  }

  clone() {
    return new Point(this.x, this.y);
  }
}

class Line {
  constructor(x1, y1, x2, y2) {
    this.start = new Point(x1, y1);
    this.end = new Point(x2, y2);
  }

  isAxisAligned() {
    return this.start.x === this.end.x || this.start.y === this.end.y;
  }
}

export const challenge = {
  title: 'Hydrothermal Venture',

  init() {
    const inputRegex = new RegExp(/(\d+),(\d+) -> (\d+),(\d+)/);

    this.lines = [];
    for (const lineStr of this.input.split(/\r?\n/)) {
      const match = inputRegex.exec(lineStr);
      if (match !== null) {
        this.lines.push(new Line(...match.slice(1, 5).map(Number)));
      }
    }
  },

  // --- Part 1 --- //
  part1ExpectedAnswer: 4728,
  solvePart1() {
    const ventMap = this.createVentMap(this.lines.filter(line => line.isAxisAligned()));

    const overlappingVents = [...ventMap].filter(entry => entry[1] > 1);

    return ['Axis-aligned vent lines overlap in {0} places', overlappingVents.length];
  },

  // --- Part 2 --- //
  part2ExpectedAnswer: 17717,
  solvePart2() {
    const ventMap = this.createVentMap(this.lines);

    const overlappingVents = [...ventMap].filter(entry => entry[1] > 1);

    return ['All vent lines overlap in {0} places', overlappingVents.length];
  },

  createVentMap(lines) {
    const ventMap = new Map();

    const addPoint = function(point) {
      const key = point.toString();
      ventMap.set(key, (ventMap.get(key) ?? 0) + 1);
    }  
    
    for (const line of lines) {
      const { start, end } = line;

      let point = start.clone();
      addPoint(point);

      while (!point.equals(end)) {
        point.x += Math.sign(end.x - start.x);
        point.y += Math.sign(end.y - start.y);
        
        addPoint(point);
      }
    }

    return ventMap;
  },
}