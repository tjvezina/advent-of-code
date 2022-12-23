// Right-hand, Y-down coordinate system

export class Point3 {
  constructor(x, y, z) { Object.assign(this, { x, y, z }); }
  
  clone() { return new Point3(this.x, this.y, this.z); }

  equals(p) { return this.x === p.x && this.y === p.y && this.z === p.z; }

  add(p) { [this.x, this.y, this.z] = [this.x + p.x, this.y + p.y, this.z + p.z]; return this; }
  
  mult(n) { [this.x, this.y, this.z] = [this.x * n, this.y * n, this.z * n]; return this; }
  
  rot90X()  { [this.y, this.z] = [-this.z,  this.y]; return this; }
  rot90Y()  { [this.x, this.z] = [ this.z, -this.x]; return this; }
  rot90Z()  { [this.x, this.y] = [-this.y,  this.x]; return this; }
  rot270X() { [this.y, this.z] = [ this.z, -this.y]; return this; }
  rot270Y() { [this.x, this.z] = [-this.z,  this.x]; return this; }
  rot270Z() { [this.x, this.y] = [ this.y, -this.x]; return this; }
}

export class Face {
  constructor(x, y, mapX, mapY) {
    this.pos = new Point3(x, y, 0);
    this.right = new Point3(1, 0, 0);
    this.down = new Point3(0, 1, 0);

    this.mapX = mapX;
    this.mapY = mapY;
  }

  get up() { return this.down.clone().mult(-1); }

  fold(origin, axis) {
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

  calculateEdges() {
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
