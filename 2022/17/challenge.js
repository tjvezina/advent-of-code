// Arbitrary value to indicate positions with rocks
const R = 0;

const CAVE_WIDTH = 7;

const ROCKS = [
  [
    [R, R, R, R],
  ],
  [
    [ , R,  ],
    [R, R, R],
    [ , R,  ],
  ],
  [
    [ ,  , R],
    [ ,  , R],
    [R, R, R],
  ],
  [
    [R],
    [R],
    [R],
    [R],
  ],
  [
    [R, R],
    [R, R],
  ],
].map(rock => rock.reverse()).map(data => ({
  data,
  width: data.map(row => row.length).reduce((a, b) => a > b ? a : b),
  height: data.length,
}));

export const challenge = {
  title: 'Pyroclastic Flow',

  init() {
    this.jetPattern = [...this.input];
  },

  // --- Part 1 --- //
  part1ExpectedAnswer: 3069,
  solvePart1() {
    this.cave = [];

    this.rockIndex = 0;
    this.jetIndex = 0;

    for (let i = 0; i < 2022; i++) {
      this.dropRock();
    }

    return ['After dropping 2022 rocks, they are piled {0} units high', this.cave.length];
  },

  // --- Part 2 --- //
  part2ExpectedAnswer: 1523167155404,
  solvePart2() {
    const ROCK_COUNT = 1000000000000;

    const statesAreEqual = (a, b) => a.rockIndex === b.rockIndex && a.jetIndex === b.jetIndex;

    this.cave = [];
    this.rockIndex = 0;
    this.jetIndex = 0;

    const prevStates = [];
    let iRepeatStart = -1;
    let iRepeatEnd = -1;

    // Look for a repeating pattern
    while (true) {
      const state = { rockIndex: this.rockIndex, jetIndex: this.jetIndex, caveHeight: this.cave.length };

      iRepeatStart = prevStates.findIndex(prev => statesAreEqual(state, prev));

      // State repeats not once...
      if (iRepeatStart !== -1) {
        iRepeatEnd = prevStates.slice(iRepeatStart + 1).findIndex(prev => statesAreEqual(state, prev)) + iRepeatStart + 1;

        // ...but twice...
        if (iRepeatEnd !== -1 && (iRepeatEnd - iRepeatStart === prevStates.length - iRepeatEnd)) {
          const [stateA, stateB, stateC] = [prevStates[iRepeatStart], prevStates[iRepeatEnd], state];

          // ...and the cave height increased by the same amount between each state pair, repeating pattern found!
          if (stateB.caveHeight - stateA.caveHeight === stateC.caveHeight - stateB.caveHeight) {
            break;
          }
        }
      }

      prevStates.push(state);

      this.dropRock();
    }

    const repeatStartState = prevStates[iRepeatStart];
    const repeatEndState = prevStates[iRepeatEnd];

    const heightPerRepeat = repeatEndState.caveHeight - repeatStartState.caveHeight;
    const repeatLength = iRepeatEnd - iRepeatStart;

    const repeatCount = Math.floor((ROCK_COUNT - iRepeatStart) / repeatLength);
    const leftover = ROCK_COUNT - iRepeatStart - (repeatCount * repeatLength);

    // The initial height created before the repeating pattern + partial pattern to reach total rock count
    const nonRepeatHeight = prevStates[iRepeatStart + leftover].caveHeight;

    const totalHeight = (heightPerRepeat * repeatCount) + nonRepeatHeight;

    return ['After dropping 1 trillion rocks, they are piled {0} units high', totalHeight];
  },

  dropRock() {
    const rock = ROCKS[this.rockIndex];
    this.rockIndex = (this.rockIndex + 1) % ROCKS.length;

    const pos = { x: 2, y: this.cave.length + 3 };

    while (true) {
      const jet = this.jetPattern[this.jetIndex];
      this.jetIndex = (this.jetIndex + 1) % this.jetPattern.length;

      switch (jet) {
        case '<': {
          pos.x--;
          if (this.checkCollision(rock, pos)) {
            pos.x++;
          }
          break;
        }
        case '>': {
          pos.x++;
          if (this.checkCollision(rock, pos)) {
            pos.x--;
          }
          break;
        }
        default: throw new Error(`Unknown jet direction "${jet}"`);
      }

      pos.y--;
      if (this.checkCollision(rock, pos)) {
        pos.y++;

        for (let ry = 0; ry < rock.height; ry++) {
          for (let rx = 0; rx < rock.width; rx++) {
            const x = rx + pos.x;
            const y = ry + pos.y;

            if (rock.data[ry][rx] === R) {
              this.cave[y] ??= [];
              this.cave[y][x] = R;
            }
          }
        }

        break;
      }
    }
  },

  checkCollision(rock, pos) {
    if (pos.y < 0 || pos.x < 0 || pos.x + rock.width - 1 >= CAVE_WIDTH) {
      return true;
    }

    for (let ry = 0; ry < rock.height; ry++) {
      for (let rx = 0; rx < rock.width; rx++) {
        const x = rx + pos.x;
        const y = ry + pos.y;

        if (rock.data[ry][rx] === R && this.cave[y]?.[x] === R) {
          return true;
        }
      }
    }

    return false;
  },
}