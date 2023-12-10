export default class Point3 {
  x: number;
  y: number;
  z: number;

  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  toString(): string {
    return `${this.x},${this.y},${this.z}`;
  }

  toArray(): [number, number, number] {
    return [this.x, this.y, this.z];
  }

  equals(other: Point3): boolean {
    return this.x === other.x && this.y === other.y && this.z === other.z;
  }

  clone(): Point3 {
    return new Point3(this.x, this.y, this.z);
  }

  add(p: Point3): Point3 {
    this.x += p.x;
    this.y += p.y;
    this.z += p.z;
    return this;
  }

  subtract(p: Point3): Point3 {
    this.x -= p.x;
    this.y -= p.y;
    this.z -= p.z;
    return this;
  }

  mult(n: number): Point3 {
    this.x *= n;
    this.y *= n;
    this.z *= n;
    return this;
  }

  rotate90X():  Point3 { [this.y, this.z] = [-this.z,  this.y]; return this; }
  rotate90Y():  Point3 { [this.x, this.z] = [ this.z, -this.x]; return this; }
  rotate90Z():  Point3 { [this.x, this.y] = [-this.y,  this.x]; return this; }
  rotate270X(): Point3 { [this.y, this.z] = [ this.z, -this.y]; return this; }
  rotate270Y(): Point3 { [this.x, this.z] = [-this.z,  this.x]; return this; }
  rotate270Z(): Point3 { [this.x, this.y] = [ this.y, -this.x]; return this; }
}
