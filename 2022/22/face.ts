import Point3 from '@framework/geometry/point3';

// Right-hand, Y-down coordinate system
export default class Face {
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

    if      (axis.x > 0) points.forEach(p => p.rotate90X());
    else if (axis.x < 0) points.forEach(p => p.rotate270X());
    else if (axis.y > 0) points.forEach(p => p.rotate90Y());
    else if (axis.y < 0) points.forEach(p => p.rotate270Y());
    else if (axis.z > 0) points.forEach(p => p.rotate90Z());
    else if (axis.z < 0) points.forEach(p => p.rotate270Z());

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
