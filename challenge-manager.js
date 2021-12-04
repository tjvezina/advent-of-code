import { existsSync, promises, createWriteStream } from 'fs';
import * as consoleUtil from './framework/console-util.js';

const resultStatus = {
  development: 0, // No answer given; hasn't been started, or isn't complete yet
  candidate: 1,   // Answer given, expected answer unknown; to be submitted to AoC
  wrongAnswer: 2, // Given answer does not match expected
  success: 3,     // Given answer matches expected
  exception: 4,   // Unhandled exception during execution
}

let partStartTime;
let partEndTime;

export function getChallengePath(year, day) { return `./${year}/${String(day).padStart(2, '0')}`; }

async function loadChallenge(year, day) {
  const path = getChallengePath(year, day);
  const challengePath = `${path}/challenge.js`;

  if (!existsSync(challengePath)) {
    console.error(`Challenge ${year}/${String(day).padStart(2, '0')} does not exist.`);
    process.exit(1);
  }

  const inputPath = `${getChallengePath(year, day)}/input.txt`;
  if (!existsSync(inputPath)) {
    console.error(`Input file for challenge ${year}/${String(day).padStart(2, '0')} does not exist.`);
    process.exit(1);
  }

  const input = await promises.readFile(inputPath, 'utf8');

  return {
    year,
    day,
    input,
    inputList: input.split('\n'),
    ...((await import(challengePath)).default)
  };
}

export async function runChallenge(year, day) {
  const challenge = await loadChallenge(year, day);

  consoleUtil.setForeground(consoleUtil.color.yellow);
  console.log(` <<< ${year} Day ${day}: ${challenge.title} >>> `);
  consoleUtil.resetColors();

  runPart(challenge, 1);
  runPart(challenge, 2);
}

function runPart(challenge, part) {
  const results = execute(challenge, part);

  setStatusColor(results.status);
  process.stdout.write(`[Part ${part}]`);
  consoleUtil.resetColors();
  process.stdout.write(' ');

  writeBenchmark();

  consoleUtil.resetColors();
  const messageParts = (results.message ?? '').split('{0}');
  if (messageParts.length > 0) {
    process.stdout.write(messageParts[0]);
  }
  consoleUtil.setForeground(consoleUtil.color.cyan);
  process.stdout.write(results.givenAnswer ?? '');
  consoleUtil.resetColors();
  if (messageParts.length > 1) {
    process.stdout.write(messageParts[1]);
  }
  console.log();
}

export async function testChallenge(year, day) {
  const challenge = await loadChallenge(year, day);

  testPart(challenge, 1);
  testPart(challenge, 2);
}

function testPart(challenge, part) {
  // Disable console output during test execution
  const write = process.stdout.write;
  process.stdout.write = function() {};
  const results = execute(challenge, part);
  process.stdout.write = write;

  consoleUtil.setForeground(part === 1 ? consoleUtil.color.blue : consoleUtil.color.darkCyan);
  process.stdout.write(`${String(challenge.day).padStart(2, '0')}-${part} `);

  setStatusColor(results.status);
  switch (results.status) {
    case resultStatus.development:
    case resultStatus.candidate:
      process.stdout.write('WIP ');
      break;
    case resultStatus.wrongAnswer:
    case resultStatus.exception:
      process.stdout.write('FAIL');
      break;
    case resultStatus.success:
      process.stdout.write('PASS');
      break;
  }
  consoleUtil.resetColors();
  process.stdout.write(' ');

  writeBenchmark();

  consoleUtil.resetColors();
  process.stdout.write(results.status == resultStatus.exception ? results.message : results.givenAnswer);
  console.log();
}

function execute(challenge, part) {
  let results = {};

  try {
    partStartTime = process.uptime();
    if (typeof challenge.reset === 'function') challenge.reset();
    const [ message, answer ] = challenge[`solvePart${part}`]() ?? [ null, null ];
    partEndTime = process.uptime();

    results.message = message;
    results.givenAnswer = answer?.toString();

    const expected = challenge[`part${part}ExpectedAnswer`]?.toString();
    if (expected !== undefined && expected.length > 0) {
      results.status = (results.givenAnswer === expected ? resultStatus.success : resultStatus.wrongAnswer);
    } else if (results.givenAnswer) {
      results.status = resultStatus.candidate;
    } else {
      results.status = resultStatus.development;
    }
  } catch (err) {
    results.status = resultStatus.exception;
    partStartTime = partEndTime = null;

    results.message = err.toString();
  }

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

  if      (elapsed <  0.25) consoleUtil.setForeground(consoleUtil.color.darkGray);
  else if (elapsed <  1.0)  consoleUtil.setForeground(consoleUtil.color.darkGreen);
  else if (elapsed <  5.0)  consoleUtil.setForeground(consoleUtil.color.darkYellow);
  else if (elapsed < 10.0)  consoleUtil.setForeground(consoleUtil.color.darkRed);
  else                      consoleUtil.setForeground(consoleUtil.color.red);

  process.stdout.write(`(${elapsedStr}s) `);
}

function setStatusColor(status) {
  switch (status) {
    case resultStatus.development:   consoleUtil.setForeground(consoleUtil.color.darkGray);                 break;
    case resultStatus.candidate:     consoleUtil.setForeground(consoleUtil.color.cyan);                     break;
    case resultStatus.wrongAnswer:   consoleUtil.setForeground(consoleUtil.color.red);                      break;
    case resultStatus.success:       consoleUtil.setForeground(consoleUtil.color.green);                    break;
    case resultStatus.exception:     consoleUtil.setColors(consoleUtil.color.black, consoleUtil.color.red); break;
    default:
      throw new Error('Unknown result status:', status);
  }
}
