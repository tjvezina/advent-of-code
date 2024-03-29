import AbstractChallenge, { Answer } from '@app/abstract-challenge';

export default class Challenge extends AbstractChallenge {
  title = 'Binary Diagnostic';

  binaryList!: string[];

  init(): void {
    this.binaryList = this.input.split(/\r?\n/);
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 3148794;
  solvePart1(): [string, Answer] {
    const { binaryList } = this;

    const bitCounts = new Array(binaryList[0].length).fill(0);

    for (const binary of binaryList) {
      for (let i = 0; i < binary.length; i++) {
        if (binary[i] === '1') {
          bitCounts[i]++;
        }
      }
    }

    const gammaRateStr = bitCounts.map(count => count > this.binaryList.length / 2 ? '1' : '0').join('');
    const epsilonRateStr = [...gammaRateStr].map(bit => bit === '1' ? '0' : '1').join('');

    const gammaRate = parseInt(gammaRateStr, 2);
    const epsilonRate = parseInt(epsilonRateStr, 2);

    return [`Gamma rate ${gammaRate} x epsilon rate ${epsilonRate} = `, gammaRate * epsilonRate];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 2795310;
  solvePart2(): [string, Answer] {
    const reduceValues = function(candidates: string[], i: number, compareFunc: (zeros: string[], ones: string[]) => boolean): string[] {
      if (candidates.length <= 1) {
        return candidates;
      }

      const [zeros, ones] = candidates.reduce(([zeros, ones], number) => {
        if (number[i] === '0') zeros.push(number);
        else                   ones.push(number);
        return [zeros, ones];
      }, [[] as string[], [] as string[]]);

      return compareFunc(zeros, ones) ? zeros : ones;
    };

    const { binaryList } = this;

    let oxyGenRatingCandidates = [...binaryList];
    let co2RatingCandidates = [...binaryList];

    for (let i = 0; i < binaryList[0].length; i++) {
      oxyGenRatingCandidates = reduceValues(oxyGenRatingCandidates, i, (zeros, ones) => zeros.length > ones.length);
      co2RatingCandidates = reduceValues(co2RatingCandidates, i, (zeros, ones) => zeros.length <= ones.length);
    }

    if (!(oxyGenRatingCandidates.length === 1) || !(co2RatingCandidates.length === 1)) {
      throw new Error(`Failed to reduce candidates to a single value: ${oxyGenRatingCandidates.length}, ${co2RatingCandidates.length}`);
    }

    const oxygenGeneratorRating = parseInt(oxyGenRatingCandidates[0], 2);
    const co2ScrubberRating = parseInt(co2RatingCandidates[0], 2);

    return [
      `Oxygen generator rating ${oxygenGeneratorRating} x CO2 scrubber rating ${co2ScrubberRating} = `,
      oxygenGeneratorRating * co2ScrubberRating,
    ];
  }
}
