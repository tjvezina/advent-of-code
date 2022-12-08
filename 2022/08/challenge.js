const UP = 0;
const RIGHT = 1;
const DOWN = 2;
const LEFT = 3;

export const challenge = {
  title: 'Treetop Tree House',

  init() {
    this.treeMap = this.input.split(/\r?\n/).map(line => [...line].map(x => parseInt(x)));

    if (this.treeMap.length !== this.treeMap[0].length) throw new Error('Expected square input');
  },

  // --- Part 1 --- //
  part1ExpectedAnswer: 1854,
  solvePart1() {
    const { treeMap } = this;

    const heightMap = new Array(treeMap.length).fill().map(_ => {
      return new Array(treeMap.length).fill().map(_ => ([]));
    });

    for (let x = 0; x < treeMap.length; x++) {
      let max = -1;
      for (let y = 0; y < treeMap.length; y++) {
        heightMap[y][x][UP] = max;
        max = Math.max(max, treeMap[y][x]);
      }
      max = -1;
      for (let y = treeMap.length - 1; y >= 0; y--) {
        heightMap[y][x][DOWN] = max;
        max = Math.max(max, treeMap[y][x]);
      }
    }

    for (let y = 0; y < treeMap.length; y++) {
      let max = -1;
      for (let x = 0; x < treeMap.length; x++) {
        heightMap[y][x][LEFT] = max;
        max = Math.max(max, treeMap[y][x]);
      }
      max = -1;
      for (let x = treeMap.length - 1; x >= 0; x--) {
        heightMap[y][x][RIGHT] = max;
        max = Math.max(max, treeMap[y][x]);
      }
    }

    const visibleCount = treeMap
      .map((row, y) => row.filter((tree, x) => heightMap[y][x].some(maxHeight => maxHeight < tree)).length)
      .reduce((a, b) => a + b);

    return ['There are {0} visible trees in the grid', visibleCount];
  },

  // --- Part 2 --- //
  part2ExpectedAnswer: 527340,
  solvePart2() {
    const { treeMap } = this;

    const scenicScores = treeMap.map((row, y) => row.map((tree, x) => {
      if (x === 0 || y === 0 || x === treeMap.length - 1 || y === treeMap.length - 1) return 0;

      let upScore = 0;
      for (let y2 = y - 1; y2 >= 0; y2--) {
        upScore++;
        if (treeMap[y2][x] >= tree) break;
      }

      let downScore = 0;
      for (let y2 = y + 1; y2 < treeMap.length; y2++) {
        downScore++;
        if (treeMap[y2][x] >= tree) break;
      }

      let leftScore = 0;
      for (let x2 = x - 1; x2 >= 0; x2--) {
        leftScore++;
        if (treeMap[y][x2] >= tree) break;
      }

      let rightScore = 0;
      for (let x2 = x + 1; x2 < treeMap.length; x2++) {
        rightScore++;
        if (treeMap[y][x2] >= tree) break;
      }

      return upScore * downScore * leftScore * rightScore;
    }));

    const maxScore = scenicScores.flatMap((row, y) => row.map((score, x) => ({ x, y, score }))).sort((a, b) => b.score - a.score)[0];

    return [`The best scenic score is {0} at (${maxScore.x}, ${maxScore.y})`, maxScore.score];
  },
}