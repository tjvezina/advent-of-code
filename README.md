# advent-of-code

Solutions to 'Advent of Code' challenges, written in JavaScript with Node.js

## Project Setup

- Install dependencies with `yarn`

## Running

Several commands take a date, in one of these formats: `YYYY`, `DD`, `YYYY/DD`

| Command                       | Description
| ----------------------------- | ------------
| `yarn start`                  | Executes the most recent existing challenge in the active year
| `yarn start <date>`           | Executes a specific challenge, or the most recent in the given year
| `yarn start example [<date>]` | Executes the given or most recent challenge with example input (input_example.txt)
| `yarn test`                   | Tests the answer and performance of the most recent existing challenge
| `yarn test <date>`            | Tests a specific challenge, or all challenges in the given year
| `yarn test all`               | Tests all challenges in all years
| `yarn create-next`            | Creates the folders/files for the next challange in the active year
| `yarn create-next <year>`     | Creates the folders/files for the next challange in the given year

## Development

### File System

Each challenge is organized by date and defined in a `<year>/<month>/challenge.js` file.

The challenge's input is stored in and loaded from an adjacent `input.txt` file.

An example input may be included in the file `input_example.txt` and tested with `yarn start example`.

### Solving

If working on challenges from a past year, set `ACTIVE_YEAR` in `index.ts`, so all commands default to that year.

After running `yarn create-next`, a challenge folder is created from the template with some boilerplate filled in.

1. Copy the challenge's input into `input.txt`.
2. Modify `init()` as necessary to handle parsing the challenge's particular input.
3. Implement `solvePart1()`, returning some flavor text and the answer (ex. `return ['The answer is', 42];`).
4. Once the answer is confirmed, set it as the value of `part1ExpectedAnswer` to allow future testing.
5. (Optional) Add `reset()` if there is any non-challenge logic to execute between parts 1 and 2.
6. Repeat steps 3-4 for `solvePart2()` / `part2ExpectedAnswer` to complete the challenge!
