import { existsSync, mkdirSync, writeFile, promises } from 'fs';
import { getChallengePath, runChallenge, testChallenge } from './challenge-manager.js';
import { ConsoleColor, log } from './framework/console-util.js';

interface ChallengeDate {
  year?: number;
  day?: number;
}

// Set to a specific year while working on challenges from that year, or null for the current year
const ACTIVE_YEAR = null;
const FIRST_YEAR = 2015;

const arg0 = process.argv[2];
const arg1 = process.argv[3];

switch (arg0) {
  case 'create':
    if (arg1 !== undefined && !isValidYear(Number(arg1))) {
      console.error('Invalid year, cannot create challenge for', arg1);
    } else {
      createChallenge(arg1 !== undefined ? Number(arg1) : getDefaultYear());
    }
    break;
  case 'test':
    if (arg1 === 'all') {
      testChallenges(FIRST_YEAR, new Date().getFullYear());
    } else {
      if (arg1 === undefined) {
        const year = getDefaultYear();
        const day = getMostRecentChallengeDay(year);
        if (day !== null) {
          testChallenges(year, undefined, day);
        } else {
          console.error(`No ${year} challenges found to test.`);
        }
      } else {
        let arg1Date = parseDateArg(arg1);
        if (arg1Date !== null) {
          testChallenges(arg1Date.year ?? getDefaultYear(), undefined, arg1Date.day ?? undefined);
        } else {
          console.error('Invalid date, must use the format YYYY, DD, or YYYY/DD');
        }
      }
    }
    break;
  default:
    const arg0Date = parseDateArg(arg0);

    if (arg0 === undefined || arg0Date !== null) {
      const year = arg0Date?.year ?? getDefaultYear();
      const day = arg0Date?.day ?? getMostRecentChallengeDay(year);
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

function getDefaultYear(): number { return ACTIVE_YEAR ?? new Date().getFullYear(); }

function isValidYear(year: number): boolean { return !isNaN(year) && year >= FIRST_YEAR && year < 3000; }
function isValidDay(day: number): boolean { return !isNaN(day) && 1 <= day && day <= 25; }

function getMostRecentChallengeDay(year: number): number | null {
  let day = 25;
  while (day > 0 && !existsSync(getChallengePath(year, day))) day--;
  return (day === 0 ? null : day);
}

function getFirstMissingChallengeDay(year: number): number | null {
  let day = 1;
  while (day <= 25 && existsSync(getChallengePath(year, day))) day++;
  return (day === 26 ? null : day);
}

// Expected formats: YYYY, DD, YYYY/DD
function parseDateArg(arg: string): ChallengeDate | null {
  const date = {} as ChallengeDate;

  const parts = (arg?.split('/') ?? ['']).map(Number);

  if (parts.every(part => !isNaN(part))) {
    if (parts.length === 1) {
      if (isValidYear(parts[0])) return { year: parts[0] };
      if (isValidDay(parts[0])) return { day: parts[0] };
    }
    if (parts.length === 2 && isValidYear(parts[0]) && isValidDay(parts[1])) {
      return { year: parts[0], day: parts[1] };
    }
  }
  
  return null;
}

async function createChallenge(year: number): Promise<void> {
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

  log.writeLine(`Created challenge ${year}/${String(day).padStart(2, '0')}`);
}

async function testChallenges(startYear: number, endYear?: number, singleDay?: number): Promise<void> {
  let wasAnyTestRun = false;
  for (let year = startYear; year <= (endYear ?? startYear); year++) {
    let yearHeaderWasDrawn = false;
    for (let day = singleDay ?? 1; day <= (singleDay ?? 25); day++) {
      if (!existsSync(`${getChallengePath(year, day)}/challenge.js`)) {
        continue;
      }

      if (!yearHeaderWasDrawn) {
        log.setForeground(ConsoleColor.Yellow);
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
      console.error(`Challenge ${startYear}/${String(singleDay).padStart(2, '0')} does not exist.`)
    } else {
      console.error(`No challenges found in ${startYear}${endYear !== undefined ? `-${endYear}` : ''} to test.`);
    }
  }
}

log.resetColors();
