enum CoordSystem {
  YUp,
  YDown,
}
export default CoordSystem;

let activeCoordSystem: CoordSystem | undefined;

namespace CoordSystem {
  export function setActive(value: CoordSystem): void {
    activeCoordSystem = value;
  }

  export function isYUp(): boolean {
    if (activeCoordSystem === undefined) {
      throw new Error('The active coordinate system has not been defined, call CoordUtil.setActive() first');
    }
    return activeCoordSystem === CoordSystem.YUp;
  }

  export function isYDown(): boolean { return !CoordSystem.isYUp(); }
}
