export interface Challenge {
  title: string,
  year: number,
  day: number,
  input: string,
  isTestMode: boolean,

  // Called once before part 1
  init?: () => void,
  // Called before each part
  reset?: () => void,

  part1ExpectedAnswer: any,
  solvePart1(): [string, any],

  part2ExpectedAnswer: any,
  solvePart2(): [string, any],
};