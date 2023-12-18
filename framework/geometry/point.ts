import CoordSystem from '@framework/geometry/coord-system';
import Direction from '@framework/geometry/direction';

export default class Point {
  static get Zero(): Point { return new Point(0, 0); }
  static get Left(): Point { return new Point(-1, 0); }
  static get Right(): Point { return new Point(1, 0); }
  static get Up(): Point { return new Point(0, CoordSystem.isYUp() ? 1 : -1); }
  static get Down(): Point { return new Point(0, CoordSystem.isYUp() ? -1 : 1); }

  static getTaxiDist(a: Point, b: Point): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  x: number;
  y: number;

  constructor(x = 0, y = 0) {
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

  move(dir: Direction, distance = 1): Point {
    const offset = Direction.toPoint(dir);
    this.x += offset.x * distance;
    this.y += offset.y * distance;
    return this;
  }

  rotate90():  Point { [this.x, this.y] = [-this.y, this.x]; return this; }
  rotate270(): Point { [this.x, this.y] = [this.y, -this.x]; return this; }

  rotateCW():  Point { return (CoordSystem.isYUp() ? this.rotate270() : this.rotate90()); }
  rotateCCW(): Point { return (CoordSystem.isYUp() ? this.rotate90() : this.rotate270()); }

  toDirection(): Direction {
    if (this.equals(Point.Right)) return Direction.Right;
    if (this.equals(Point.Down))  return Direction.Down;
    if (this.equals(Point.Left))  return Direction.Left;
    if (this.equals(Point.Up))    return Direction.Up;

    throw new Error(`Failed to convert ${this} to a Direction, must be a unit vector`);
  }
}
