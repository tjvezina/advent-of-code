import AbstractChallenge, { Answer } from '@app/abstract-challenge';

type DirData = {
  [key: string]: DirData | number,
};

export default class Challenge extends AbstractChallenge {
  title = 'No Space Left On Device';

  rootDir: DirData = { };
  dirSizeMap: Map<string, number> = new Map();

  init(): void {
    this.buildDirectoryMap(this.input.split(/\r?\n/));

    this.calculateDirSize('', this.rootDir);
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 1886043;
  solvePart1(): [string, Answer] {
    const smallDirSum = [...this.dirSizeMap.values()].filter(size => size <= 100_000).reduce((a, b) => a + b);

    return ['The sum of all directories under 100,000 is ', smallDirSum];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 3842121;
  solvePart2(): [string, Answer] {
    const TOTAL_SPACE = 70_000_000;
    const REQUIRED_SPACE = 30_000_000;

    const spaceToDelete = REQUIRED_SPACE - (TOTAL_SPACE - (this.dirSizeMap.get('/') as number));

    const sortedDirs = [...this.dirSizeMap.entries()].sort((a, b) => a[1] - b[1]);

    const [dirToDelete, dirToDeleteSize] = sortedDirs.find(dir => dir[1] >= spaceToDelete) as [string, number];

    return [`Deleting ${dirToDelete} would free up {0} space`, dirToDeleteSize];
  }

  buildDirectoryMap(lines: string[]): void {
    let currentPath: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const [, command, , arg] = lines[i].match(/\$ (\w+)( ([\w./]+))?/)!;

      if (command === 'cd') {
        if (arg === '/') {
          currentPath = [];
        } else if (arg === '..') {
          currentPath.pop();
        } else {
          currentPath.push(arg);
        }
      } else if (command === 'ls') {
        let dir = this.rootDir;
        currentPath.forEach(dirName => (dir = dir[dirName] as DirData));

        if (Object.values(dir).length > 0) {
          throw new Error(`ls was already run for path /${currentPath.reduce((a, b) => `${a}/${b}`)}`);
        }

        while ((i+1) < lines.length && !lines[i+1].startsWith('$')) {
          const [, data, name] = lines[++i].match(/(\w+) ([\w.]+)/)!;

          if (data === 'dir') {
            dir[name] = { };
          } else {
            dir[name] = parseInt(data);
          }
        }
      }
    }
  }

  calculateDirSize(path: string, data: DirData): number {
    let size = 0;

    Object.entries(data).forEach(([name, value]) => {
      if (typeof value === 'number') {
        size += value;
      } else {
        size += this.calculateDirSize(`${path}/${name}`, value);
      }
    });

    this.dirSizeMap.set(path || '/', size);
    return size;
  }
}
