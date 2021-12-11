import { existsSync, promises } from 'fs';
import { Challenge } from './challenge.js';
import { log } from './framework/console-util.js';
import { Color } from './framework/color.js';

const enum ResultStatus {
  Development, // No answer given; hasn't been started, or isn't complete yet
  Candidate,   // Answer given, expected answer unknown; to be submitted to AoC
  WrongAnswer, // Given answer does not match expected
  Success,     // Given answer matches expected
  Exception,   // Unhandled exception during execution
}

interface Results {
  status: ResultStatus,
  message: string,
  givenAnswer: any,
}

type Part = 1 | 2;

let partStartTime: number | null = null;
let partEndTime: number | null = null;

export function getChallengePath(year: number, day: number): string { return `./${year}/${String(day).padStart(2, '0')}`; }

async function loadChallenge(year: number, day: number): Promise<Challenge> {
  const path = getChallengePath(year, day);

  const challengePath = `${path}/challenge.js`;
  if (!existsSync(challengePath)) {
    console.error(`Challenge ${year}/${String(day).padStart(2, '0')} does not exist.`);
    process.exit(1);
  }

  const inputPath = `${path}/input.txt`;
  if (!existsSync(inputPath)) {
    console.error(`Input file for challenge ${year}/${String(day).padStart(2, '0')} does not exist.`);
    process.exit(1);
  }

  const { challenge } = await import(challengePath);
  const input = await promises.readFile(inputPath, 'utf8');

  return { year, day, input, ...challenge };
}

export async function runChallenge(year: number, day: number): Promise<void> {
  const challenge = await loadChallenge(year, day);

  log.setForeground(Color.Yellow);
  log.writeLine(` <<< ${year} Day ${day}: ${challenge.title} >>> `);
  log.resetColors();

  runPart(challenge, 1);
  runPart(challenge, 2);
}

function runPart(challenge: Challenge, part: Part) {
  const results = execute(challenge, part);

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

export async function testChallenge(year: number, day: number): Promise<void> {
  const challenge = await loadChallenge(year, day);

  testPart(challenge, 1);
  testPart(challenge, 2);
}

function testPart(challenge: Challenge, part: Part) {
  log.disableStdout();
  const results = execute(challenge, part);
  log.enableStdout();

  log.setForeground(part === 1 ? Color.Blue : Color.DarkCyan, { bold: true });
  log.write(`${String(challenge.day).padStart(2, '0')}-${part} `);

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

function execute(challenge: Challenge, part: Part): Results {
  let results = {} as Results;

  try {
    partStartTime = process.uptime();
    if (part === 1 && challenge.init !== undefined) challenge.init();
    if (challenge.reset !== undefined) challenge.reset();
    const [message, answer] = challenge[`solvePart${part}`]() ?? [ null, null ];
    partEndTime = process.uptime();

    results.message = message;
    results.givenAnswer = answer;

    const expected = challenge[`part${part}ExpectedAnswer`];
    if (expected !== null) {
      results.status = (results.givenAnswer === expected ? ResultStatus.Success : ResultStatus.WrongAnswer);
    } else if (results.givenAnswer !== null) {
      results.status = ResultStatus.Candidate;
    } else {
      results.status = ResultStatus.Development;
    }
  } catch (err) {
    results.status = ResultStatus.Exception;
    partStartTime = partEndTime = null;

    results.message = `${err}`;
  }

  log.resetColors();
  return results;
}

function writeBenchmark() {
  if (!partStartTime || !partEndTime) return;

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

function setStatusColor(status: ResultStatus) {
  switch (status) {
    case ResultStatus.Development:   log.setForeground(Color.DarkGray);     break;
    case ResultStatus.Candidate:     log.setForeground(Color.Cyan);         break;
    case ResultStatus.WrongAnswer:   log.setForeground(Color.Red);          break;
    case ResultStatus.Success:       log.setForeground(Color.Green);        break;
    case ResultStatus.Exception:     log.setColors(Color.Black, Color.Red); break;
    default:
      throw new Error(`Unknown result status: ${status}`);
  }
}
