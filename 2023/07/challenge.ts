import AbstractChallenge, { Answer } from '@app/abstract-challenge';

const CARDS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2', '1'] as const;
type Card = typeof CARDS[number];

type Hand = {
  cards: [Card, Card, Card, Card, Card],
  bid: number,
}

enum HandType {
  FiveOfAKind,
  FourOfAKind,
  FullHouse,
  ThreeOfAKind,
  TwoPair,
  OnePair,
  HighCard,
}

export default class Challenge extends AbstractChallenge {
  title = 'Camel Cards';

  hands!: Hand[];

  init(): void {
    const lines = this.input.split(/\r?\n/);
    this.hands = lines.map(line => {
      const [cards, bid] = line.split(' ');
      return {
        cards: [...cards] as Hand['cards'],
        bid: parseInt(bid),
      };
    });
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 256448566;
  solvePart1(): [string, Answer] {
    const winnings = this.calculateWinnings({ useJokerRules: false });
    return ['The total winnings are ', winnings];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 254412181;
  solvePart2(): [string, Answer] {
    const winnings = this.calculateWinnings({ useJokerRules: true });
    return ['The total winnings are ', winnings];
  }

  calculateWinnings({ useJokerRules }: { useJokerRules: boolean }): number {
    const handTypeMap = this.hands.reduce((map, hand) => {
      const cardCountMap: Partial<Record<Card, number>> = {};
      let jokerCount = 0;
      for (const card of hand.cards) {
        if (useJokerRules && card === 'J') {
          jokerCount++;
        } else {
          cardCountMap[card] = (cardCountMap[card] ?? 0) + 1;
        }
      }

      const cardCounts = Object.values(cardCountMap).sort((a, b) => b - a);
      cardCounts[0] = (cardCounts[0] ?? 0) + jokerCount;
      switch (cardCounts[0]) {
        case 5: map.set(hand, HandType.FiveOfAKind); break;
        case 4: map.set(hand, HandType.FourOfAKind); break;
        case 3:
          switch (cardCounts[1]) {
            case 2:  map.set(hand, HandType.FullHouse);    break;
            default: map.set(hand, HandType.ThreeOfAKind); break;
          }
          break;
        case 2:
          switch (cardCounts[1]) {
            case 2:  map.set(hand, HandType.TwoPair); break;
            default: map.set(hand, HandType.OnePair); break;
          }
          break;
        default: map.set(hand, HandType.HighCard); break;
      }
      return map;
    }, new Map<Hand, HandType>());

    const sortedHands = [...this.hands].sort((a, b) => {
      const typeA = handTypeMap.get(a)!;
      const typeB = handTypeMap.get(b)!;
      if (typeA !== typeB) {
        return typeA - typeB;
      } else {
        for (let i = 0; i < 5; i++) {
          const cardA = a.cards[i];
          const cardB = b.cards[i];
          let iCardA = CARDS.indexOf(cardA);
          let iCardB = CARDS.indexOf(cardB);
          if (useJokerRules) {
            if (cardA === 'J') {
              iCardA = CARDS.length;
            }
            if (cardB === 'J') {
              iCardB = CARDS.length;
            }
          }
          if (iCardA !== iCardB) {
            return iCardA - iCardB;
          }
        }
      }
      return 0;
    });

    return [...sortedHands].reverse().map(({ bid }, i) => bid * (i + 1)).reduce((a, b) => a + b);
  }
}
