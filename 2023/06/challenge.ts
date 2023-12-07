import AbstractChallenge, { Answer } from '@app/abstract-challenge';

type Race = {
  time: number,
  record: number,
}

export default class Challenge extends AbstractChallenge {
  title = 'Wait For It';

  races!: Race[];
  megaRace!: Race;

  init(): void {
    const [timeListStr, distListStr] = this.input.split(/\r?\n/).map(line => line.split(':')[1]);

    const timeList = [...timeListStr.matchAll(/\d+/g)].map(match => parseInt(match[0]));
    const distList = [...distListStr.matchAll(/\d+/g)].map(match => parseInt(match[0]));

    this.races = timeList.map((time, i) => ({ time, record: distList[i] }));
    this.megaRace = {
      time: parseInt(timeList.map(t => `${t}`).reduce((a, b) => a + b)),
      record: parseInt(distList.map(d => `${d}`).reduce((a, b) => a + b)),
    };
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 4403592;
  solvePart1(): [string, Answer] {
    const waysToWinCounts = this.races.map(race => {
      let waysToWin = 0;
      for (let iWait = 1; iWait < race.time; iWait++) {
        if (iWait * (race.time - iWait) > race.record) {
          waysToWin++;
        }
      }
      return waysToWin;
    });

    const waysToWinProduct = waysToWinCounts.reduce((a, b) => a * b);
    return ['The product of the number of ways to win each race is ', waysToWinProduct];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 38017587;
  solvePart2(): [string, Answer] {
    const { time: t, record: r } = this.megaRace;

    // -n^2 + tn - d = 0
    const x = Math.sqrt((t * t) - (4 * r));
    const minWaitTime = (t - x) / 2;
    const maxWaitTime = (t + x) / 2;

    const waysToWin = (Math.ceil(maxWaitTime) - 1) - (Math.floor(minWaitTime) + 1) + 1;
    return ['There are {0} ways to win the big race', waysToWin];
  }
}
