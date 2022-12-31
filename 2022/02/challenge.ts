import AbstractChallenge, { Answer } from '@app/abstract-challenge';

enum Move {
  Rock = 1,
  Paper = 2,
  Scissors = 3,
}

enum Result {
  Lose = 0,
  Draw = 3,
  Win = 6,
}

export default class Challenge extends AbstractChallenge {
  title = 'Rock Paper Scissors';

  inputLines!: string[];

  init(): void {
    this.inputLines = this.input.split(/\r?\n/);
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 12156;
  solvePart1(): [string, Answer] {
    const OPPONENT_MAP = {
      'A': Move.Rock,
      'B': Move.Paper,
      'C': Move.Scissors,
    } as { [key: string]: Move };

    const PLAYER_MAP = {
      'X': Move.Rock,
      'Y': Move.Paper,
      'Z': Move.Scissors,
    } as { [key: string]: Move };

    const playerScores = this.inputLines.map(line => {
      const [opponentMoveCode, playerMoveCode] = line.match(/[A-Z]/g)!;

      const opponentMove = OPPONENT_MAP[opponentMoveCode];
      const playerMove = PLAYER_MAP[playerMoveCode];

      let diff = (playerMove - opponentMove);
      diff = ((((diff + 1) % 3) + 3) % 3) - 1;

      const result = (diff < 0 ? Result.Lose : (diff > 0 ? Result.Win : Result.Draw));

      return playerMove + result;
    });

    const totalPlayerScore = playerScores.reduce((a, b) => a + b);

    return ['The total player score would be ', totalPlayerScore];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 10835;
  solvePart2(): [string, Answer] {
    const OPPONENT_MAP = {
      'A': Move.Rock,
      'B': Move.Paper,
      'C': Move.Scissors,
    } as { [key: string]: Move };

    const RESULT_MAP = {
      'X': Result.Lose,
      'Y': Result.Draw,
      'Z': Result.Win,
    } as { [key: string]: Result };

    const playerScores = this.inputLines.map(line => {
      const [opponentMoveCode, resultCode] = line.match(/[A-Z]/g)!;

      const opponentMove = OPPONENT_MAP[opponentMoveCode];
      const result = RESULT_MAP[resultCode];

      let playerMove = opponentMove + (result === Result.Lose ? -1 : result === Result.Win ? 1 : 0);
      playerMove = ((((playerMove - 1) % 3) + 3) % 3) + 1;

      return playerMove + result;
    });

    const totalPlayerScore = playerScores.reduce((a, b) => a + b);

    return ['The total player score would be {0}, when ending rounds correctly.', totalPlayerScore];
  }
}
