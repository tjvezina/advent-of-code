import AbstractChallenge, { Answer } from '@app/abstract-challenge';
import { Color } from '@framework/color';
import { log } from '@framework/console-util';

const BOARD_SIZE = 5;

export default class Challenge extends AbstractChallenge {
  title = 'Giant Squid';

  numbers!: number[];
  boards!: number[][][];

  lineCountMap!: { rows: number[], cols: number[] }[];

  init(): void {
    const inputLines = this.input.split(/\r?\n/);

    this.numbers = inputLines[0].split(',').map(x => parseInt(x));

    this.boards = [];
    for (let i = 2; i < inputLines.length; i += 6) {
      this.boards.push([...inputLines.slice(i, i+5).map(line => line.match(/\d+/g)!.map(x => parseInt(x)))]);
    }
  }

  reset(): void {
    this.lineCountMap = new Array(this.boards.length);
    for (let i = 0; i < this.lineCountMap.length; i++) {
      this.lineCountMap[i] = { rows: new Array(BOARD_SIZE).fill(0), cols: new Array(BOARD_SIZE).fill(0) };
    }
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 87456;
  solvePart1(): [string, Answer] {
    for (let i = 0; i < this.numbers.length; i++) {
      const number = this.numbers[i];
      const winnerIndicies = this.callNumber(number);

      if (winnerIndicies.length > 1) {
        throw new Error('Multiple winners found, unable to pick one.');
      }

      if (winnerIndicies.length > 0) {
        const winningBoard = this.boards[winnerIndicies[0]];
        const calledNumbers = this.numbers.slice(0, i + 1);
        const unmarkedNumbers = winningBoard.flatMap(x => x).filter(x => !calledNumbers.includes(x));
        const score = unmarkedNumbers.reduce((a, b) => a + b) * number;

        if (!this.isTestMode) {
          this.printBoard(winnerIndicies[0], calledNumbers);
        }

        return [`After calling ${number}, the winner's final score is `, score];
      }
    }

    throw new Error('All numbers called but no winner found.');
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 15561;
  solvePart2(): [string, Answer] {
    let boardIndices = this.boards.map((_, i) => i);

    for (let i = 0; i < this.numbers.length; i++) {
      const number = this.numbers[i];
      const winnerIndicies = this.callNumber(number, boardIndices);

      if (winnerIndicies.length > 0) {
        if (boardIndices.length === 1) {
          const winningBoard = this.boards[winnerIndicies[0]];
          const calledNumbers = this.numbers.slice(0, i + 1);
          const unmarkedNumbers = winningBoard.flatMap(x => x).filter(x => !calledNumbers.includes(x));
          const score = unmarkedNumbers.reduce((a, b) => a + b) * number;

          if (!this.isTestMode) {
            this.printBoard(winnerIndicies[0], calledNumbers);
          }

          return [`After calling ${number}, the last winner's final score is `, score];
        } else if (boardIndices.length === winnerIndicies.length) {
          throw new Error('Multiple boards tied for last winner, unable to pick one.');
        }

        boardIndices = boardIndices.filter(i => !winnerIndicies.includes(i));
      }
    }

    throw new Error(`Failed to find last winner, ${boardIndices.length} boards still in play after all numbers were called.`);
  }

  callNumber(number: number, boardIndices?: number[]): number[] {
    const winnerIndicies = [];

    for (const i of boardIndices ?? this.boards.map((_, i) => i)) {
      const board = this.boards[i];
      const lineCounts = this.lineCountMap[i];
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          if (board[row][col] === number) {
            if (++lineCounts.rows[row] === BOARD_SIZE || ++lineCounts.cols[col] === BOARD_SIZE) {
              winnerIndicies.push(i);
            }
          }
        }
      }
    }

    return winnerIndicies;
  }

  printBoard(boardIndex: number, calledNumbers: number[]): void {
    const board = this.boards[boardIndex];

    log.writeLine();
    log.setForeground(Color.DarkYellow);
    log.writeLine(` Bingo Card #${boardIndex + 1}`);
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const number = board[row][col];
        log.setForeground(calledNumbers.includes(number) ? Color.Green : Color.DarkGray);
        log.write(`${number}`.padStart(3, ' '));
      }
      log.write(' ');
      log.resetColors();
      log.writeLine();
    }
    log.writeLine();
  }
}
