import CoordSystem from '@framework/geometry/coord-system';
import Point from '@framework/geometry/point';

enum Direction {
  Right,
  Down,
  Left,
  Up,
}
export default Direction;

namespace Direction {
  export function values(): Direction[] {
    return [Direction.Right, Direction.Down, Direction.Left, Direction.Up];
  }

  export function isHorizontal(direction: Direction): boolean {
    return direction === Direction.Right || direction === Direction.Left;
  }
  export function isVertical(direction: Direction): boolean {
    return !Direction.isHorizontal(direction);
  }

  export function isPositive(direction: Direction): boolean {
    return direction === Direction.Right ||
      direction === (CoordSystem.isYUp() ? Direction.Up : Direction.Down);
  }
  export function isNegative(direction: Direction): boolean {
    return !Direction.isPositive(direction);
  }

  export function rotateCW(direction: Direction): Direction {
    switch (direction) {
      case Direction.Right: return Direction.Down;
      case Direction.Down:  return Direction.Left;
      case Direction.Left:  return Direction.Up;
      case Direction.Up:    return Direction.Right;
      default:
        throw new Error(`Unknown direction "${direction}`);
    }
  }

  export function rotateCCW(direction: Direction): Direction {
    switch (direction) {
      case Direction.Right: return Direction.Up;
      case Direction.Down:  return Direction.Right;
      case Direction.Left:  return Direction.Down;
      case Direction.Up:    return Direction.Left;
      default:
        throw new Error(`Unknown direction "${direction}`);
    }
  }

  export function getOpposite(direction: Direction): Direction {
    switch (direction) {
      case Direction.Right: return Direction.Left;
      case Direction.Down:  return Direction.Up;
      case Direction.Left:  return Direction.Right;
      case Direction.Up:    return Direction.Down;
      default:
        throw new Error(`Unknown direction "${direction}`);
    }
  }

  export function getOrthogonals(direction: Direction): [Direction, Direction] {
    return [
      Direction.rotateCW(direction),
      Direction.rotateCCW(direction),
    ];
  }

  export function toPoint(direction: Direction): Point {
    const p = new Point(0, 0);
    switch (direction) {
      case Direction.Right: p.x =  1; break;
      case Direction.Down:  p.y = -1; break;
      case Direction.Left:  p.x = -1; break;
      case Direction.Up:    p.y =  1; break;
      default:
        throw new Error(`Unknown direction "${direction}`);
    }

    if (CoordSystem.isYDown()) {
      p.y *= -1;
    }

    return p;
  }

  export function getX(direction: Direction): number {
    switch (direction) {
      case Direction.Right: return  1;
      case Direction.Left:  return -1;
      default:              return  0;
    }
  }

  export function getY(direction: Direction): number {
    let y = 0;
    switch (direction) {
      case Direction.Up:   y =  1; break;
      case Direction.Down: y = -1; break;
    }
    if (CoordSystem.isYDown()) {
      y *= -1;
    }
    return y;
  }
}
