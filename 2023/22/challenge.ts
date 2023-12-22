import AbstractChallenge, { Answer } from '@app/abstract-challenge';
import Point from '@framework/geometry/point';
import Point3 from '@framework/geometry/point3';

type Block = {
  min: Point3,
  max: Point3,
}

type FallenBlock = Block & {
  supportedBy: FallenBlock[],
  supporting: FallenBlock[],
}

export default class Challenge extends AbstractChallenge {
  title = 'Sand Slabs';

  blockList!: Block[];
  fallenBlockList: FallenBlock[] = [];

  init(): void {
    this.blockList = this.input.split(/\r?\n/).map(line => {
      const [x1, y1, z1, x2, y2, z2] = line.split('~').flatMap(part => part.split(',')).map(x => parseInt(x));
      return { min: new Point3(x1, y1, z1), max: new Point3(x2, y2, z2) };
    });
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 391;
  solvePart1(): [string, Answer] {
    const sortedBlockList = [...this.blockList].sort((a, b) => a.min.z - b.min.z);
    const columnMap = new Map<string, FallenBlock>();

    for (const block of sortedBlockList) {
      const column = new Point(block.min.x, block.min.y);
      const lastColumn = new Point(block.max.x, block.max.y);
      const step = new Point(Math.sign(block.max.x - block.min.x), Math.sign(block.max.y - block.min.y));

      const columnList = [column.clone()];
      while (!column.equals(lastColumn)) {
        column.add(step);
        columnList.push(column.clone());
      }

      const columnBlockList = columnList.map(column => columnMap.get(`${column}`))
        .filter(block => block !== undefined) as FallenBlock[];

      const maxZ = columnBlockList.map(block => block.max.z).reduce((a, b) => Math.max(a, b), 0);

      const supportedBy = columnBlockList.filter((block, i) => block.max.z === maxZ && columnBlockList.indexOf(block) === i);

      const fallenBlock: FallenBlock = {
        min: block.min.clone(),
        max: block.max.clone(),
        supporting: [],
        supportedBy,
      };
      const fallDist = block.min.z - (maxZ + 1);
      fallenBlock.min.z -= fallDist;
      fallenBlock.max.z -= fallDist;

      for (const supportingBlock of supportedBy) {
        supportingBlock.supporting.push(fallenBlock);
      }

      this.fallenBlockList.push(fallenBlock);
      for (const column of columnList) {
        columnMap.set(`${column}`, fallenBlock);
      }
    }

    const disintegrateOptionList = this.fallenBlockList
      .filter(block => block.supporting.length === 0 || block.supporting.every(supported => supported.supportedBy.length > 1));

    return ['There are {0} blocks that could safely be disintegrated', disintegrateOptionList.length];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 69601;
  solvePart2(): [string, Answer] {
    const supportedBlockCountList = this.fallenBlockList.map(block => {
      const openSet = block.supporting.filter(supported => supported.supportedBy.length === 1);
      const wouldFall: FallenBlock[] = [];

      while (openSet.length > 0) {
        const nextBlock = openSet.shift()!;

        for (const supported of nextBlock.supporting) {
          if (supported.supportedBy.length === 1 || supported.supportedBy.every(supporter => supporter === nextBlock || wouldFall.includes(supporter))) {
            openSet.push(supported);
          }
        }

        wouldFall.push(nextBlock);
      }

      return wouldFall.length;
    });

    const supportedBlockCountSum = supportedBlockCountList.reduce((a, b) => a + b);

    return ['The sum all blocks that would fall if each were disintegrated is ', supportedBlockCountSum];
  }
}
