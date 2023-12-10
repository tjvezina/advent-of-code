import CoordSystem from '@framework/geometry/coord-system';
import Direction from '@framework/geometry/direction';

export default class Point {
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

  move(dir: Direction): Point {
    this.add(Direction.toPoint(dir));
    return this;
  }

  rotate90():  Point { [this.x, this.y] = [-this.y, this.x]; return this; }
  rotate270(): Point { [this.x, this.y] = [this.y, -this.x]; return this; }

  rotateCW():  Point { return (CoordSystem.isYUp() ? this.rotate270() : this.rotate90()); }
  rotateCCW(): Point { return (CoordSystem.isYUp() ? this.rotate90() : this.rotate270()); }

  toDirection(): Direction {
    let { x, y } = this;

    if (CoordSystem.isYDown()) {
      y *= -1;
    }

    if (x ===  1 && y ===  0) return Direction.Right;
    if (x ===  0 && y === -1) return Direction.Down;
    if (x === -1 && y ===  0) return Direction.Left;
    if (x ===  0 && y ===  1) return Direction.Up;

    throw new Error(`Failed to convert ${this} to a Direction, must be a unit vector`);
  }
}
