export interface Challenge {
  title: string,
  year: number,
  day: number,

  initInput(input: string): void,

  reset? :() => void,

  part1ExpectedAnswer: any,
  solvePart1(): [string, any],

  part2ExpectedAnswer: any,
  solvePart2(): [string, any],
};