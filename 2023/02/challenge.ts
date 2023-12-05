import AbstractChallenge, { Answer } from '@app/abstract-challenge';

enum CubeColor {
  Red = 'red',
  Green = 'green',
  Blue = 'blue',
}

type Game = Record<CubeColor, number>[]

export default class Challenge extends AbstractChallenge {
  title = 'Cube Conundrum';

  games!: Game[];

  init(): void {
    const lines = this.input.split(/\r?\n/);

    this.games = lines.map(line => {
      const [, gameStr] = line.split(': ');
      const samples = gameStr.split('; ');
      return samples.map(sample => {
        const counts = { [CubeColor.Red]: 0, [CubeColor.Green]: 0, [CubeColor.Blue]: 0 };
        for (const [count, color] of sample.split(', ').map(colorStr => colorStr.split(' '))) {
          counts[color as CubeColor] += parseInt(count);
        }
        return counts;
      });
    });
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 2685;
  solvePart1(): [string, Answer] {
    const maxCounts: Record<CubeColor, number> = {
      [CubeColor.Red]: 12,
      [CubeColor.Green]: 13,
      [CubeColor.Blue]: 14,
    };

    const validGameIDs: number[] = [];

    gameLoop:
    for (const [index, game] of this.games.entries()) {
      for (const sample of game) {
        for (const cubeColor of Object.values(CubeColor)) {
          if (sample[cubeColor] > maxCounts[cubeColor]) {
            continue gameLoop;
          }
        }
      }

      validGameIDs.push(index + 1);
    }

    const sumOfValidGameIDs = validGameIDs.reduce((a, b) => a + b);

    return ['The valid game ID sum is ', sumOfValidGameIDs];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 83707;
  solvePart2(): [string, Answer] {
    let powerSum = 0;

    for (const game of this.games) {
      const maxCounts: Record<CubeColor, number> = {
        [CubeColor.Red]: 0,
        [CubeColor.Green]: 0,
        [CubeColor.Blue]: 0,
      };

      for (const sample of game) {
        for (const cubeColor of Object.values(CubeColor)) {
          maxCounts[cubeColor] = Math.max(maxCounts[cubeColor], sample[cubeColor]);
        }
      }

      const power = Object.values(maxCounts).reduce((a, b) => a * b);
      powerSum += power;
    }

    return ['The sum of all game powers is ', powerSum];
  }
}
