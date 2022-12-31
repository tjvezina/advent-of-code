import AbstractChallenge, { Answer } from '@app/abstract-challenge';

enum LineStatus {
  Valid = 0,
  SyntaxError = 1,
  Incomplete = 2,
}

type Status = {
  status: LineStatus,
  expected?: ChunkEnd,
  found?: ChunkEnd,
  missing?: ChunkEnd[],
};

type ChunkStart = '(' | '[' | '{' | '<';
type ChunkEnd = ')' | ']' | '}' | '>';

const CHUNK_MAP = {
  '(': ')',
  '[': ']',
  '{': '}',
  '<': '>',
} as { [key in ChunkStart]: ChunkEnd };

const POINT_MAP_PART_1 = {
  ')': 3,
  ']': 57,
  '}': 1197,
  '>': 25137,
} as { [key in ChunkEnd]: number };

const POINT_MAP_PART_2 = {
  ')': 1,
  ']': 2,
  '}': 3,
  '>': 4,
} as { [key in ChunkEnd]: number };

export default class Challenge extends AbstractChallenge {
  title = 'Syntax Scoring';

  lines!: string[];
  results!: Status[];

  init(): void {
    this.lines = this.input.split(/\r?\n/);
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 319233;
  solvePart1(): [string, Answer] {
    this.results = this.lines.map(this.checkLine);

    const errors = this.results.filter(result => result.status === LineStatus.SyntaxError);

    const scores = errors.map(result => POINT_MAP_PART_1[result.found!]);

    return ['The total syntax error score is ', scores.reduce((a, b) => a + b)];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 1118976874;
  solvePart2(): [string, Answer] {
    const missingChars = this.results.filter(result => result.status === LineStatus.Incomplete).map(result => result.missing);

    const scores = missingChars.map(missing => missing!.reduce((a, b) => a * 5 + POINT_MAP_PART_2[b], 0));

    return ['The median incomplete line score is ', scores.sort((a, b) => a - b)[(scores.length - 1) / 2]];
  }

  checkLine(line: string): Status {
    const chunkStack: ChunkStart[] = [];

    const startChars = Object.keys(CHUNK_MAP);

    for (const char of [...line]) {
      if (startChars.includes(char)) {
        chunkStack.push(char as ChunkStart);
      } else {
        const lastOpen = chunkStack.pop()!;
        if (char !== CHUNK_MAP[lastOpen]) {
          return { status: LineStatus.SyntaxError, expected: CHUNK_MAP[lastOpen], found: char as ChunkEnd };
        }
      }
    }

    if (chunkStack.length > 0) {
      return { status: LineStatus.Incomplete, missing: chunkStack.map(c => CHUNK_MAP[c]).reverse() };
    }

    return { status: LineStatus.Valid };
  }
}
