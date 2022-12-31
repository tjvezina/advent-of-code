export class Point {
  static getTaxiDist(a: Point, b: Point): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  toString(): string {
    return `${this.x},${this.y}`;
  }

  equals(other: Point): boolean {
    return this.x === other.x && this.y === other.y;
  }

  clone(): Point {
    return new Point(this.x, this.y);
  }

  add(p: Point): Point {
    this.x += p.x;
    this.y += p.y;
    return this;
  }
}

export class Line {
  start: Point;
  end: Point;

  constructor(x1: number, y1: number, x2: number, y2: number) {
    this.start = new Point(x1, y1);
    this.end = new Point(x2, y2);
  }

  isAxisAligned(): boolean {
    return this.start.x === this.end.x || this.start.y === this.end.y;
  }
}
