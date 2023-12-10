import ChallengeManager from '@app/challenge-manager';
import { log } from '@framework/console-util';

interface ChallengeDate {
  year?: number;
  day?: number;
}

// Set to a specific year while working on challenges from that year, or null for the current year
const ACTIVE_YEAR: number | null = null;
const FIRST_YEAR = 2015;

const [arg0, arg1] = process.argv.slice(2, 4);

switch (arg0) {
  case 'create': {
    if (arg1 !== undefined && !isValidYear(parseInt(arg1))) {
      console.error('Invalid year, cannot create challenge for', arg1);
    } else {
      const year = (arg1 !== undefined ? parseInt(arg1) : getDefaultYear());
      if (!isValidYear(year)) {
        console.error(`Invalid year, cannot create challenge for ${year}.`);
      } else {
        ChallengeManager.createNextChallenge(arg1 !== undefined ? parseInt(arg1) : getDefaultYear());
      }
    }
    break;
  }
  case 'test': {
    if (arg1 === 'all') {
      ChallengeManager.testChallengesInRange(FIRST_YEAR, new Date().getFullYear());
    } else {
      if (arg1 === undefined) {
        const year = getDefaultYear();
        const day = ChallengeManager.getMostRecentChallengeDay(year);
        if (day !== null) {
          ChallengeManager.testChallengesInRange(year, undefined, day);
        } else {
          console.error(`No ${year} challenges found to test.`);
        }
      } else {
        const arg1Date = parseDateArg(arg1);
        if (arg1Date !== null) {
          ChallengeManager.testChallengesInRange(arg1Date.year ?? getDefaultYear(), undefined, arg1Date.day ?? undefined);
        } else {
          console.error('Invalid date, must use the format YYYY, DD, or YYYY/DD');
        }
      }
    }
    break;
  }
  default: {
    if (arg0 === 'example') {
      const arg1Date = parseDateArg(arg1);

      const year = arg1Date?.year ?? getDefaultYear();
      const day = arg1Date?.day ?? ChallengeManager.getMostRecentChallengeDay(year);
      if (day === null) {
        console.error(`No ${year} challenges found.`);
      } else {
        ChallengeManager.runChallenge(year, day, true);
      }
    } else {
      const arg0Date = parseDateArg(arg0);

      if (arg0 === undefined || arg0Date !== null) {
        const year = arg0Date?.year ?? getDefaultYear();
        const day = arg0Date?.day ?? ChallengeManager.getMostRecentChallengeDay(year);
        if (day === null) {
          console.error(`No ${year} challenges found.`);
        } else {
          ChallengeManager.runChallenge(year, day);
        }
      } else {
        console.error('Unknown command:', arg0);
      }
    }
    break;
  }
}

function getMostRecentYear(): number { return new Date().getFullYear() - (new Date().getMonth() < 10 ? 1 : 0); }
function getDefaultYear(): number { return ACTIVE_YEAR ?? getMostRecentYear(); }

function isValidYear(year: number): boolean { return !isNaN(year) && year >= FIRST_YEAR && year <= getMostRecentYear(); }
function isValidDay(day: number): boolean { return !isNaN(day) && day >= 1 && day <= 25; }

// Supported formats: YYYY, DD, YYYY/DD
function parseDateArg(arg: string): ChallengeDate | null {
  const parts = (arg?.split('/') ?? ['']).map(x => parseInt(x));

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

log.resetColors();
