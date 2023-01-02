export type PointVector = [number, number, number];

export default class Point3 {
  vector: PointVector;

  get x(): number { return this.vector[0]; }
  get y(): number { return this.vector[1]; }
  get z(): number { return this.vector[2]; }

  constructor(x: number, y: number, z: number) {
    this.vector = [x, y, z];
  }

  clone(): Point3 { return new Point3(...this.vector); }

  equals(other: Point3): boolean { return this.vector.every((value, i) => value === other.vector[i]); }

  add(other: Point3): Point3 {
    this.vector[0] += other.vector[0];
    this.vector[1] += other.vector[1];
    this.vector[2] += other.vector[2];
    return this;
  }

  subtract(other: Point3): Point3 {
    this.vector[0] -= other.vector[0];
    this.vector[1] -= other.vector[1];
    this.vector[2] -= other.vector[2];
    return this;
  }

  mult(n: number): Point3 {
    this.vector[0] *= n;
    this.vector[1] *= n;
    this.vector[2] *= n;
    return this;
  }

  toString(): string { return `(${this.vector.join(', ')})`; }
}
