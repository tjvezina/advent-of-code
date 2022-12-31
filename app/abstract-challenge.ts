export type Answer = number | string | null;

export default abstract class AbstractChallenge {
  abstract title: string;

  year: number;
  day: number;
  input: string;
  isTestMode = false;

  constructor(year: number, day: number, input: string) {
    this.year = year;
    this.day = day;
    this.input = input;
  }

  init?(): void;

  reset?(): void;

  abstract part1ExpectedAnswer: Answer;
  abstract solvePart1(): [string, Answer] | Promise<[string, Answer]>;

  abstract part2ExpectedAnswer: Answer;
  abstract solvePart2(): [string, Answer] | Promise<[string, Answer]>;
}
