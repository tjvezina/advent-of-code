import Point3, { PointVector } from './point3';

/**
 * An orientation represents one of 24 arrangements in which an object's forward/up/right vectors are axis-aligned.
 *   Ex: the default orientation (in a right-hand Y-up system) is Forward = +Z / Up = +Y / Right = +X
 * This type contains `transform` and `inverseTransform`, for rotating points from the default orientation to
 * another orientation, and back again.
 *
 * Note: the actual forward/up vectors of each orientation are not given or important, we simply need to cover
 * all 24 possibilities, regardless of order or specific values.
 */
export type Orientation = {
  transform: (p: Point3) => Point3,
  inverseTransform: (p: Point3) => Point3,
}

/* eslint-disable array-bracket-spacing */
const EVEN_ORDER_PERMUTATIONS = [
  [0, 1, 2],
  [1, 2, 0],
  [2, 0, 1],
];

const ODD_ORDER_PERMUTATIONS = [
  [0, 2, 1],
  [1, 0, 2],
  [2, 1, 0],
];

const EVEN_SIGN_PERMUTATIONS = [
  [ 1,  1,  1],
  [-1, -1,  1],
  [-1,  1, -1],
  [ 1, -1, -1],
];

const ODD_SIGN_PERMUTATIONS = [
  [-1,  1,  1],
  [ 1, -1,  1],
  [ 1,  1, -1],
  [-1, -1, -1],
];
/* eslint-enable */

/**
 * Generates a list of all 24 possible orientations.
 * Each orientation is achieved by some sequence of 90 deg rotations around the basis axes. Each 90 deg rotation
 * results in swapping two vector components and negating one; as a short cut to cover all possible orientations,
 * simply iterate over all combinations of component swaps and negations.
 *
 * Note: This is split into "even" and "odd" order/sign permutations, because the number of swaps/negations must match,
 * i.e. each rotation results in exactly ONE swap and ONE negation; if the number of swaps and negations have different
 * parity, the result is not a rotation but a reflection over the plane of two axes, and not a valid oritentation.
 */
export function generateOrientationList(): Orientation[] {
  const orientationList: Orientation[] = [];

  for (let iOrder = 0; iOrder < 3; iOrder++) {
    for (let iSigns = 0; iSigns < 4; iSigns++) {
      orientationList.push(createOrientation(EVEN_ORDER_PERMUTATIONS[iOrder], EVEN_SIGN_PERMUTATIONS[iSigns]));
      orientationList.push(createOrientation(ODD_ORDER_PERMUTATIONS[iOrder], ODD_SIGN_PERMUTATIONS[iSigns]));
    }
  }

  return orientationList;
}

function createOrientation(order: number[], signs: number[]): Orientation {
  return {
    transform: (p: Point3): Point3 => {
      return new Point3(...p.vector.map((_, i) => p.vector[order[i]] * signs[i]) as PointVector);
    },
    inverseTransform: (p: Point3): Point3 => {
      return new Point3(...p.vector.map((_, i) => {
        const iInverse = order.indexOf(i);
        return p.vector[iInverse] * signs[iInverse];
      }) as PointVector);
    },
  };
}
