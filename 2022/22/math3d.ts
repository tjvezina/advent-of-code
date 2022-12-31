// Right-hand, Y-down coordinate system

export class Point3 {
  x: number;
  y: number;
  z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  clone(): Point3 { return new Point3(this.x, this.y, this.z); }

  equals(p: Point3): boolean { return this.x === p.x && this.y === p.y && this.z === p.z; }

  add(p: Point3): Point3 { [this.x, this.y, this.z] = [this.x + p.x, this.y + p.y, this.z + p.z]; return this; }

  mult(n: number): Point3 { [this.x, this.y, this.z] = [this.x * n, this.y * n, this.z * n]; return this; }

  /* eslint-disable array-bracket-spacing */
  rot90X(): Point3  { [this.y, this.z] = [-this.z,  this.y]; return this; }
  rot90Y(): Point3  { [this.x, this.z] = [ this.z, -this.x]; return this; }
  rot90Z(): Point3  { [this.x, this.y] = [-this.y,  this.x]; return this; }
  rot270X(): Point3 { [this.y, this.z] = [ this.z, -this.y]; return this; }
  rot270Y(): Point3 { [this.x, this.z] = [-this.z,  this.x]; return this; }
  rot270Z(): Point3 { [this.x, this.y] = [ this.y, -this.x]; return this; }
  /* eslint-enable */
}

export class Face {
  pos: Point3;
  right: Point3;
  down: Point3;

  mapX: number;
  mapY: number;

  edges!: Point3[][];

  adjacentFaces?: { face: number, edge: number }[];

  constructor(x: number, y: number, mapX: number, mapY: number) {
    this.pos = new Point3(x, y, 0);
    this.right = new Point3(1, 0, 0);
    this.down = new Point3(0, 1, 0);

    this.mapX = mapX;
    this.mapY = mapY;
  }

  get up(): Point3 { return this.down.clone().mult(-1); }

  fold(origin: Point3, axis: Point3): void {
    const points = [this.pos, this.right, this.down];

    this.pos.add(origin.clone().mult(-1));

    if      (axis.x > 0) points.forEach(p => p.rot90X());
    else if (axis.x < 0) points.forEach(p => p.rot270X());
    else if (axis.y > 0) points.forEach(p => p.rot90Y());
    else if (axis.y < 0) points.forEach(p => p.rot270Y());
    else if (axis.z > 0) points.forEach(p => p.rot90Z());
    else if (axis.z < 0) points.forEach(p => p.rot270Z());

    this.pos.add(origin);
  }

  calculateEdges(): void {
    const { pos, right, down } = this;

    const [v0, v1, v2, v3] = [
      pos.clone(),
      pos.clone().add(right),
      pos.clone().add(right).add(down),
      pos.clone().add(down),
    ];

    this.edges = [
      [v0, v1],
      [v1, v2],
      [v2, v3],
      [v3, v0],
    ];
  }
}
