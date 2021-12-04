import { existsSync, mkdirSync, writeFile, promises } from 'fs';
import { getChallengePath, runChallenge, testChallenge } from './challenge-manager.js';
import * as consoleUtil from './framework/console-util.js';

// Set to a specific year while working on challenges from that year, or null for the current year
const ACTIVE_YEAR = null;
const FIRST_YEAR = 2015;

const arg0 = process.argv[2];
const arg1 = process.argv[3];

switch (arg0) {
  case 'create':
    if (arg1 !== undefined && !isValidYear(arg1)) {
      console.error('Invalid year, cannot create challenge for', arg1);
    } else {
      createChallenge(arg1 ?? getDefaultYear());
    }
    break;
  case 'test':
    if (arg1 === 'all') {
      testAllChallenges();
    } else {
      let { year, day } = parseDateArg(arg1);
      if (year === null) year = getDefaultYear();
      if (day === null) day = getMostRecentChallengeDay(year);
      if (day === null) {
        console.error(`No ${year} challenges found.`);
      } else {
        testChallenge(year, day);
      }
    }
    break;
  default:
    const arg0Date = parseDateArg(arg0);

    if (arg0 === undefined || (arg0Date.year !== null || arg0Date.day !== null)) {
      const year = arg0Date.year ?? getDefaultYear();
      const day = arg0Date.day ?? getMostRecentChallengeDay(year);
      if (day === null) {
        console.error(`No ${year} challenges found.`);
      } else {
        runChallenge(year, day);
      }
    } else {
      console.error('Unknown command:', arg0);
    }
    break;
}

function getDefaultYear() { return ACTIVE_YEAR ?? new Date().getFullYear(); }

function isValidYear(year) { return !isNaN(year) && year >= FIRST_YEAR && year < 3000; }
function isValidDay(day) { return !isNaN(day) && 1 <= day && day <= 25; }

function getMostRecentChallengeDay(year) {
  let day = 25;
  while (day > 0 && !existsSync(getChallengePath(year, day))) day--;
  return (day === 0 ? null : day);
}

function getFirstMissingChallengeDay(year) {
  let day = 1;
  while (day <= 25 && existsSync(getChallengePath(year, day))) day++;
  return (day === 26 ? null : day);
}

// Expected formats: YYYY, DD, YYYY/DD
function parseDateArg(arg) {
  const parts = arg?.split('/') ?? [''];

  if (parts.every(part => !isNaN(part))) {
    if (parts.length === 1) {
      if (isValidYear(parts[0])) return { year: parts[0], day: null };
      if (isValidDay(parts[0])) return { year: null, day: parts[0] };
    }
    
    if (parts.length === 2 && isValidYear(parts[0]) && isValidDay(parts[1])) {
      return { year: parts[0], day: parts[1] };
    }
  }
  
  return { year: null, day: null };
}

async function createChallenge(year) {
  if (!isValidYear(year)) {
    console.error(`Invalid year, cannot create challenge for ${year}.`);
    return;
  }
  const day = getFirstMissingChallengeDay(year);

  if (day === null) {
    console.error(`All ${year} challenges already exist.`);
    return;
  }

  const path = getChallengePath(year, day);

  const challengeTemplate = await promises.readFile('./challenge-template.txt', 'utf8');

  mkdirSync(path, { recursive: true });
  writeFile(`${path}/challenge.js`, challengeTemplate, err => err && console.error('Failed to create challenge file:', err));
  writeFile(`${path}/input.txt`, '', err => err && console.error('Failed to create input file:', err));

  console.log(`Created challenge ${year}/${String(day).padStart(2, '0')}`);
}

function testAllChallenges() {
  console.error('Not yet implemented');
  process.exit(1);
}

consoleUtil.resetColors();
