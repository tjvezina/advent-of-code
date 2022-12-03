const ROCK = 1;
const PAPER = 2;
const SCISSORS = 3;

const LOSE = 0;
const DRAW = 3;
const WIN = 6;

export const challenge = {
  title: '',

  init() {
    this.inputLines = this.input.split(/\r?\n/);
  },

  // --- Part 1 --- //
  part1ExpectedAnswer: 12156,
  solvePart1() {
    const OPPONENT_MAP = {
      'A': ROCK,
      'B': PAPER,
      'C': SCISSORS,
    };

    const PLAYER_MAP = {
      'X': ROCK,
      'Y': PAPER,
      'Z': SCISSORS,
    };

    const playerScores = this.inputLines.map(line => {
      const [opponentMoveCode, playerMoveCode] = line.match(/[A-Z]/g);

      const opponentMove = OPPONENT_MAP[opponentMoveCode];
      const playerMove = PLAYER_MAP[playerMoveCode];

      let diff = (playerMove - opponentMove);
      diff = ((((diff + 1) % 3) + 3) % 3) - 1;

      const result = (diff < 0 ? LOSE : (diff > 0 ? WIN : DRAW));

      return playerMove + result;
    });

    const totalPlayerScore = playerScores.reduce((a, b) => a + b);

    return ['The total player score would be ', totalPlayerScore];
  },

  // --- Part 2 --- //
  part2ExpectedAnswer: 10835,
  solvePart2() {
    const OPPONENT_MAP = {
      'A': ROCK,
      'B': PAPER,
      'C': SCISSORS,
    };

    const RESULT_MAP = {
      'X': LOSE,
      'Y': DRAW,
      'Z': WIN,
    };

    const playerScores = this.inputLines.map(line => {
      const [opponentMoveCode, resultCode] = line.match(/[A-Z]/g);

      const opponentMove = OPPONENT_MAP[opponentMoveCode];
      const result = RESULT_MAP[resultCode];

      let playerMove = opponentMove + (result === LOSE ? -1 : result === WIN ? 1 : 0);
      playerMove = ((((playerMove - 1) % 3) + 3) % 3) + 1;

      return playerMove + result;
    });

    const totalPlayerScore = playerScores.reduce((a, b) => a + b);

    return ['The total player score would be {0}, when ending rounds correctly.', totalPlayerScore];
  },
}