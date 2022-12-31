import AbstractChallenge, { Answer } from '@app/abstract-challenge';
import { Color } from '@framework/color';
import { log } from '@framework/console-util';
import * as fs from 'fs';

enum ResultStatus {
  Development, // No answer given; hasn't been started, or isn't complete yet
  Example,     // Example input used
  Candidate,   // Answer given, expected answer unknown; to be submitted to AoC
  WrongAnswer, // Given answer does not match expected
  Success,     // Given answer matches expected
  Exception,   // Unhandled exception during execution
}

type Results = {
  status: ResultStatus,
  message: string,
  givenAnswer: Answer,
}

type Part = 1 | 2;

let partStartTime: number | null = null;
let partEndTime: number | null = null;

function getChallengePath(year: number, day: number): string { return `${year}/${`${day}`.padStart(2, '0')}`; }

export function getMostRecentChallengeDay(year: number): number | null {
  let day = 25;
  while (day > 0 && !fs.existsSync(getChallengePath(year, day))) {
    day--;
  }
  return (day === 0 ? null : day);
}

export async function createNextChallenge(year: number): Promise<void> {
  let day = 1;
  while (day <= 25 && fs.existsSync(getChallengePath(year, day))) {
    day++;
  }

  if (day > 25) {
    console.error(`All ${year} challenges already exist.`);
    return;
  }

  const path = getChallengePath(year, day);

  const challengeTemplate = await fs.promises.readFile('app/challenge-template.txt', 'utf8');

  fs.mkdirSync(path, { recursive: true });
  fs.writeFile(`${path}/challenge.ts`, challengeTemplate, err => err && console.error('Failed to create challenge file:', err));
  fs.writeFile(`${path}/input.txt`, '', err => err && console.error('Failed to create input file:', err));

  log.writeLine(`Created challenge ${year}/${`${day}`.padStart(2, '0')}`);
}

async function loadChallenge(year: number, day: number, exampleInput = false): Promise<AbstractChallenge> {
  const path = getChallengePath(year, day);

  const challengePath = `${path}/challenge.ts`;
  if (!fs.existsSync(challengePath)) {
    console.error(`Challenge ${year}/${`${day}`.padStart(2, '0')} does not exist.`);
    process.exit(1);
  }

  const inputPath = (exampleInput ? `${path}/input_example.txt` : `${path}/input.txt`);
  if (!fs.existsSync(inputPath)) {
    console.error(`${exampleInput ? 'Example input' : 'Input'} file for challenge ${year}/${`${day}`.padStart(2, '0')} does not exist.`);
    process.exit(1);
  }

  const module = await import(challengePath);
  const input = await fs.promises.readFile(inputPath, 'utf8');

  // eslint-disable-next-line new-cap
  return new module.default(year, day, input);
}

export async function runChallenge(year: number, day: number, exampleInput = false): Promise<void> {
  const challenge = await loadChallenge(year, day, exampleInput);

  log.setForeground(Color.Yellow);
  log.writeLine(` <<< ${year} Day ${day}: ${challenge.title} >>> `);
  log.resetColors();

  await runPart(challenge, 1, exampleInput);
  await runPart(challenge, 2, exampleInput);
}

async function runPart(challenge: AbstractChallenge, part: Part, exampleInput: boolean): Promise<void> {
  const results = await execute(challenge, part, true, exampleInput);

  setStatusColor(results.status);
  log.write(`[Part ${part}]`);
  log.resetColors();
  log.write(' ');

  writeBenchmark();

  log.resetColors();
  const messageParts = (results.message ?? '').split('{0}');
  if (messageParts.length > 0) {
    log.write(messageParts[0]);
  }
  log.setForeground(Color.Cyan, { bold: true });
  log.write(results.givenAnswer ?? '');
  log.resetColors();
  if (messageParts.length > 1) {
    log.write(messageParts[1]);
  }
  log.writeLine();
}

export async function testChallengesInRange(startYear: number, endYear?: number, singleDay?: number): Promise<void> {
  let wasAnyTestRun = false;
  for (let year = startYear; year <= (endYear ?? startYear); year++) {
    let yearHeaderWasDrawn = false;
    for (let day = singleDay ?? 1; day <= (singleDay ?? 25); day++) {
      if (!fs.existsSync(`${getChallengePath(year, day)}/challenge.ts`)) {
        continue;
      }

      if (!yearHeaderWasDrawn) {
        log.setForeground(Color.Yellow);
        log.writeLine(`-- ${year} --`);
        log.resetColors();

        yearHeaderWasDrawn = true;
      }

      wasAnyTestRun = true;
      await testChallenge(year, day);
    }
  }

  if (!wasAnyTestRun) {
    if (singleDay !== undefined) {
      console.error(`Challenge ${startYear}/${`${singleDay}`.padStart(2, '0')} does not exist.`);
    } else {
      console.error(`No challenges found in ${startYear}${endYear !== undefined ? `-${endYear}` : ''} to test.`);
    }
  }
}

async function testChallenge(year: number, day: number): Promise<void> {
  const challenge = await loadChallenge(year, day);
  challenge.isTestMode = true;

  await testPart(challenge, 1);
  await testPart(challenge, 2);
}

async function testPart(challenge: AbstractChallenge, part: Part): Promise<void> {
  log.disableStdout();
  const results = await execute(challenge, part, false);
  log.enableStdout();

  log.setForeground(part === 1 ? Color.Blue : Color.DarkCyan, { bold: true });
  log.write(`${`${challenge.day}`.padStart(2, '0')}-${part} `);

  setStatusColor(results.status);
  switch (results.status) {
    case ResultStatus.Development:
    case ResultStatus.Candidate:
      log.write('WIP ');
      break;
    case ResultStatus.WrongAnswer:
    case ResultStatus.Exception:
      log.write('FAIL');
      break;
    case ResultStatus.Success:
      log.write('PASS');
      break;
  }
  log.resetColors();
  log.write(' ');

  writeBenchmark();

  log.resetColors();
  log.writeLine(results.status === ResultStatus.Exception ? results.message : results.givenAnswer ?? '');
}

async function execute(challenge: AbstractChallenge, part: Part, includeExceptionCallStack: boolean, exampleInput = false): Promise<Results> {
  const results = {} as Results;

  try {
    partStartTime = process.uptime();
    if (part === 1) challenge.init?.();
    challenge.reset?.();
    const [message, answer] = await challenge[`solvePart${part}`]() ?? [null, null];
    partEndTime = process.uptime();

    results.message = message;
    results.givenAnswer = answer;

    if (exampleInput) {
      results.status = ResultStatus.Example;
    } else {
      const expected = challenge[`part${part}ExpectedAnswer`];
      if (expected !== null) {
        results.status = (results.givenAnswer === expected ? ResultStatus.Success : ResultStatus.WrongAnswer);
      } else if (results.givenAnswer !== null) {
        results.status = ResultStatus.Candidate;
      } else {
        results.status = ResultStatus.Development;
      }
    }
  } catch (err) {
    results.status = ResultStatus.Exception;
    partStartTime = partEndTime = null;

    results.message = (includeExceptionCallStack && (err as Error) !== undefined ? `${(err as Error).stack}` : `${err}`);
  }

  log.resetColors();
  return results;
}

function writeBenchmark(): void {
  if (partStartTime === null || partEndTime === null) return;

  const elapsed = partEndTime - partStartTime;

  let elapsedStr;
  if      (elapsed < 10)   elapsedStr = elapsed.toFixed(3);
  else if (elapsed < 100)  elapsedStr = elapsed.toFixed(2);
  else if (elapsed < 1000) elapsedStr = elapsed.toFixed(1);
  else                     elapsedStr = '>1000';

  if      (elapsed <  0.25) log.setForeground(Color.DarkGray);
  else if (elapsed <  1.0)  log.setForeground(Color.DarkGreen);
  else if (elapsed <  5.0)  log.setForeground(Color.DarkYellow);
  else if (elapsed < 10.0)  log.setForeground(Color.DarkRed);
  else                      log.setForeground(Color.Red);

  log.write(`(${elapsedStr}s) `);
}

function setStatusColor(status: ResultStatus): void {
  switch (status) {
    case ResultStatus.Development:  log.setForeground(Color.DarkGray);      break;
    case ResultStatus.Example:      log.setForeground(Color.Magenta);       break;
    case ResultStatus.Candidate:    log.setForeground(Color.Cyan);          break;
    case ResultStatus.WrongAnswer:  log.setForeground(Color.Red);           break;
    case ResultStatus.Success:      log.setForeground(Color.Green);         break;
    case ResultStatus.Exception:    log.setColors(Color.Black, Color.Red);  break;
    default:
      throw new Error(`Unknown result status: ${status}`);
  }
}
