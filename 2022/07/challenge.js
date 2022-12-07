export const challenge = {
  title: 'No Space Left On Device',

  init() {
    this.inputLines = this.input.split(/\r?\n/);
  },

  // --- Part 1 --- //
  part1ExpectedAnswer: 1886043,
  solvePart1() {
    this.buildDirectoryMap();

    const dirSizeMap = { };

    function calculateDirSize(path, data) {
      let size = 0;

      Object.entries(data).forEach(([name, value]) => {
        if (typeof value === 'number') {
          size += value;
        } else {
          size += calculateDirSize(`${path}/${name}`, data[name]);
        }
      });

      dirSizeMap[path || '/'] = size;
      return size;
    }

    calculateDirSize('', this.filesystem);

    this.dirSizeMap = dirSizeMap;

    const smallDirSum = Object.values(dirSizeMap).filter(size => size <= 100000).reduce((a, b) => a + b);

    return ['The sum of all directories under 100,000 is ', smallDirSum];
  },

  // --- Part 2 --- //
  part2ExpectedAnswer: 3842121,
  solvePart2() {
    const TOTAL_SPACE = 70000000;
    const REQUIRED_SPACE = 30000000;

    const spaceToDelete = REQUIRED_SPACE - (TOTAL_SPACE - this.dirSizeMap['/']);

    const sortedDirs = Object.entries(this.dirSizeMap).sort((a, b) => a[1] - b[1]);

    const dirToDelete = sortedDirs.find(dir => dir[1] >= spaceToDelete);

    return [`Deleting ${dirToDelete[0]} would free up {0} space`, dirToDelete[1]];
  },

  buildDirectoryMap() {
    this.filesystem = { };

    let currentPath = undefined;
    
    for (let i = 0; i < this.inputLines.length; i++) {
      const [, command, , arg] = this.inputLines[i].match(/\$ (\w+)( ([\w./]+))?/);

      if (command === 'cd') {
        if (arg === '/') {
          currentPath = [];
        } else if (arg === '..') {
          currentPath.pop();
        } else {
          currentPath.push(arg);
        }
      } else if (command === 'ls') {
        let dir = this.filesystem;
        currentPath.forEach(dirName => (dir = dir[dirName]));

        if (Object.values(dir).length > 0) {
          throw new Error(`ls was already run for path /${currentPath.reduce((a, b) => `${a}/${b}`)}`);
        }

        while ((i+1) < this.inputLines.length && !this.inputLines[i+1].startsWith('$')) {
          const [, data, name] = this.inputLines[++i].match(/(\w+) ([\w.]+)/);

          if (data === 'dir') {
            dir[name] = { };
          } else {
            dir[name] = parseInt(data);
          }
        }
      }
    }
  },
}