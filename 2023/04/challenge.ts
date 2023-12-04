import AbstractChallenge, { Answer } from '@app/abstract-challenge';

type Card = {
  numbers: number[],
  winners: number[],
  matchingCount?: number,
}

export default class Challenge extends AbstractChallenge {
  title = 'Scratchcards';

  cards!: Card[];
  winningNumberCounts: number[] = [];

  init(): void {
    const lines = this.input.split(/\r?\n/);

    this.cards = lines.map(line => {
      const [winnersStr, numbersStr] = line.split(': ')[1].split(' | ');
      return {
        numbers: [...numbersStr.matchAll(/\d+/g)].map(match => Number(match[0])),
        winners: [...winnersStr.matchAll(/\d+/g)].map(match => Number(match[0])),
      };
    });
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 23673;
  solvePart1(): [string, Answer] {
    const cardPoints: number[] = [];

    for (const card of this.cards) {
      card.matchingCount = card.numbers.filter(n => card.winners.includes(n)).length;

      const points = (card.matchingCount === 0 ? 0 : Math.pow(2, card.matchingCount - 1));
      cardPoints.push(points);
    }

    const pointsSum = cardPoints.reduce((a, b) => a + b);
    return ['The scratchcards are collectively worth {0} points', pointsSum];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = null;
  solvePart2(): [string, Answer] {
    const cardQuantities: number[] = new Array(this.cards.length).fill(1);

    for (const [iCard, card] of this.cards.entries()) {
      for (let iDuplicate = iCard + 1; iDuplicate <= iCard + card.matchingCount!; iDuplicate++) {
        if (iDuplicate >= this.cards.length) {
          break;
        }

        cardQuantities[iDuplicate] += cardQuantities[iCard];
      }
    }

    const totalCards = cardQuantities.reduce((a, b) => a + b);
    return ['You end up with {0} total scratchcards', totalCards];
  }
}
