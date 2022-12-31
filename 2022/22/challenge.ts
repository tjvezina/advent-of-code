import AbstractChallenge, { Answer } from '@app/abstract-challenge';
import { Point } from '@framework/geometry';
import * as Maths from '@framework/maths';

import { Face } from './math3d';

class Dir {
  static RIGHT = new Point(1, 0);
  static DOWN = new Point(0, 1);
  static LEFT = new Point(-1, 0);
  static UP = new Point(0, -1);

  static rotateCW(dir: Point): Point {
    switch (dir) {
      case Dir.RIGHT: return Dir.DOWN;
      case Dir.DOWN: return Dir.LEFT;
      case Dir.LEFT: return Dir.UP;
      case Dir.UP: return Dir.RIGHT;
      default:
        throw new Error(`Invalid direction: ${dir}`);
    }
  }

  static rotateCCW(dir: Point): Point {
    switch (dir) {
      case Dir.RIGHT: return Dir.UP;
      case Dir.DOWN: return Dir.RIGHT;
      case Dir.LEFT: return Dir.DOWN;
      case Dir.UP: return Dir.LEFT;
      default:
        throw new Error(`Invalid direction: ${dir}`);
    }
  }
}

type Step = number | 'L' | 'R';

type Cell = typeof SPACE | typeof WALL | undefined;

const SPACE = 0;
const WALL = 1;

export default class Challenge extends AbstractChallenge {
  title = 'Monkey Map';

  map!: Cell[][];
  steps!: Step[];

  faceSize!: number;
  faces!: Face[];

  init(): void {
    const lines = this.input.split(/\r?\n/);

    this.map = lines.slice(0, -2).map(line => [...line].map(c => (c === '#' ? WALL : (c === '.' ? SPACE : undefined))));

    this.steps = lines.slice(-1)[0].split(/(L|R)/).map(step => (step === 'L' || step === 'R' ? step : parseInt(step)));
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 97356;
  solvePart1(): [string, Answer] {
    let pos = new Point(this.map[0].findIndex(c => c === SPACE), 0);
    let dir = Dir.RIGHT;

    for (const step of this.steps) {
      if (step === 'L') {
        dir = Dir.rotateCCW(dir);
        continue;
      }
      if (step === 'R') {
        dir = Dir.rotateCW(dir);
        continue;
      }

      for (let i = 0; i < step; i++) {
        const next = pos.clone();

        do {
          if (dir.x !== 0) {
            next.x = Maths.mod(next.x + dir.x, this.map[next.y].length);
          } else {
            next.y = Maths.mod(next.y + dir.y, this.map.length);
          }
        } while (this.map[next.y]?.[next.x] === undefined);

        if (this.map[next.y][next.x] === WALL) {
          break;
        }

        pos = next;
      }
    }

    const password = 1000 * (pos.y + 1) + 4 * (pos.x + 1) + [Dir.RIGHT, Dir.DOWN, Dir.LEFT, Dir.UP].indexOf(dir);

    return [`The final position is (${pos.x}, ${pos.y}), giving the password `, password];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 120175;
  solvePart2(): [string, Answer] {
    this.detectCubeFaces();

    let pos = new Point(this.map[0].findIndex(c => c === SPACE), 0);
    let dir = Dir.RIGHT;

    for (const step of this.steps) {
      if (step === 'L') {
        dir = Dir.rotateCCW(dir);
        continue;
      }
      if (step === 'R') {
        dir = Dir.rotateCW(dir);
        continue;
      }

      for (let i = 0; i < step; i++) {
        let nextPos = new Point(pos.x + dir.x, pos.y + dir.y);
        let nextDir = dir;

        if (this.map[nextPos.y]?.[nextPos.x] === undefined) {
          [nextPos, nextDir] = this.cubeWrap(pos, dir);
        }

        if (this.map[nextPos.y][nextPos.x] === WALL) {
          break;
        }

        pos = nextPos;
        dir = nextDir;
      }
    }

    const password = 1000 * (pos.y + 1) + 4 * (pos.x + 1) + [Dir.RIGHT, Dir.DOWN, Dir.LEFT, Dir.UP].indexOf(dir);

    return [`The final position is (${pos.x}, ${pos.y}), giving the password `, password];
  }

  detectCubeFaces(): void {
    const mapWidth = this.map.reduce((max, row) => Math.max(max, row.length), 0);
    const mapHeight = this.map.length;

    this.faceSize = Maths.gcd(mapWidth, mapHeight);

    // Identify the 6 faces of the cube and their positions
    const faces: Face[] = [];
    for (let y = 0; y < mapHeight; y += this.faceSize) {
      for (let x = 0; x < mapWidth; x += this.faceSize) {
        if (this.map[y][x] !== undefined) {
          faces.push(new Face(x / this.faceSize, y / this.faceSize, x, y));
        }
      }
    }

    // Indentify each pair of adjacent faces, representing each fold that must be made
    const facePairs = [];
    for (let iA = 0; iA < faces.length - 1; iA++) {
      const a = faces[iA];
      for (let iB = iA + 1; iB < faces.length; iB++) {
        const b = faces[iB];

        if (b.pos.x === a.pos.x + 1 && b.pos.y === a.pos.y) {
          facePairs.push({ iA, iB, isHorizontal: true });
        } else if (b.pos.x === a.pos.x && b.pos.y === a.pos.y + 1) {
          facePairs.push({ iA, iB, isHorizontal: false });
        }
      }
    }

    // Fold each pair
    for (const { iA, iB, isHorizontal } of facePairs) {
      // Gather all faces on B's side of the fold, to rotate together
      const foldIndices = [iB];
      const openSet = [iB];
      while (openSet.length > 0) {
        const iNext = openSet.shift();
        const adjacent = facePairs
          .filter(pair => pair.iA === iNext || pair.iB === iNext)
          .flatMap(pair => [pair.iA, pair.iB])
          .filter(i => i !== iA && !foldIndices.includes(i));

        foldIndices.push(...adjacent);

        openSet.push(...adjacent);
      }

      const b = faces[iB];
      const origin = b.pos.clone();
      const axis = (isHorizontal ? b.up : b.right).clone();
      foldIndices.forEach(i => faces[i].fold(origin, axis));
    }

    faces.forEach(face => face.calculateEdges());

    // Build a list of edge connections for wrapping map movements later
    for (let iFace = 0; iFace < faces.length; iFace++) {
      const face = faces[iFace];
      face.adjacentFaces ??= [];

      for (let iEdge = 0; iEdge < 4; iEdge++) {
        if (face.adjacentFaces[iEdge] !== undefined) continue;

        const edge = face.edges[iEdge];
        for (let iOtherFace = 0; iOtherFace < faces.length; iOtherFace++) {
          if (iFace === iOtherFace) continue;

          const iOtherEdge = faces[iOtherFace].edges.findIndex(otherEdge => edge[0].equals(otherEdge[1]) && edge[1].equals(otherEdge[0]));

          if (iOtherEdge !== -1) {
            face.adjacentFaces[iEdge] = {
              face: iOtherFace,
              edge: iOtherEdge,
            };
          }
        }
      }
    }

    this.faces = faces;
  }

  cubeWrap(pos: Point, dir: Point): [Point, Point] {
    const faceA = this.faces.find(face => (pos.x - face.mapX) < this.faceSize && (pos.y - face.mapY) < this.faceSize)!;
    const edgeA = [Dir.UP, Dir.RIGHT, Dir.DOWN, Dir.LEFT].indexOf(dir);

    const faceB = this.faces[faceA.adjacentFaces![edgeA].face];
    const edgeB = faceA.adjacentFaces![edgeA].edge;

    // Position relative to top-left of face
    const facePos = new Point(pos.x - faceA.mapX, pos.y - faceA.mapY);

    // Rotate to normalize position along top edge
    for (let i = 0; i < edgeA; i++) {
      [facePos.x, facePos.y] = [facePos.y, (this.faceSize-1) - facePos.x];
    }

    // Invert to flip to the adjacent face
    facePos.x = (this.faceSize-1) - facePos.x;

    // Rotate back to the adjacent face's edge
    for (let i = 0; i < edgeB; i++) {
      [facePos.x, facePos.y] = [(this.faceSize-1) - facePos.y, facePos.x];
    }

    const nextPos = new Point(facePos.x + faceB.mapX, facePos.y + faceB.mapY);

    // Rotate to face the appropriate map direction for the next face
    let nextDir = dir;
    const rotCount = Maths.mod((edgeB - edgeA) + 2, 4);
    for (let i = 0; i < rotCount; i++) {
      nextDir = Dir.rotateCW(nextDir);
    }

    return [nextPos, nextDir];
  }
}
