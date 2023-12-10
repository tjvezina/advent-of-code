import Point from '@framework/geometry/point';

export default class Line {
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
