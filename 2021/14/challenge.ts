import AbstractChallenge, { Answer } from '@app/abstract-challenge';

type RuleMap = { [key: string]: [string, string] };
type PairMap = { [key: string]: number };

export default class Challenge extends AbstractChallenge {
  title = 'Extended Polymerization';

  template!: string;
  ruleMap!: RuleMap;

  polymerPairs!: PairMap;

  init(): void {
    const parts = this.input.split(/(?:\r?\n){2}/);

    this.template = parts[0];
    this.ruleMap = parts[1].split(/\r?\n/)
      .map(line => line.match(/(\w\w) -> (\w)/)!.slice(1))
      .reduce((rules, [key, value]) => {
        rules[key] = [key[0] + value, value + key[1]];
        return rules;
      }, {} as RuleMap);

    this.polymerPairs = Object.keys(this.ruleMap).reduce((pairs, key) => ({ ...pairs, [key]: 0 }), {} as PairMap);

    for (const pair of [...this.template.matchAll(/(?=(\w\w))/g)].map(match => match[1])) {
      this.polymerPairs[pair]++;
    }
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 2003;
  solvePart1(): [string, Answer] {
    for (let i = 0; i < 10; i++) {
      this.step();
    }

    const counts = this.getCounts();

    const highest = counts.slice(-1)[0];
    const lowest = counts[0];
    const quantityLimitDifference = highest[1] - lowest[1];

    return [`After 10 steps, ${highest[0]} x ${highest[1]} - ${lowest[0]} x ${lowest[1]} = `, quantityLimitDifference];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 2276644000111;
  solvePart2(): [string, Answer] {
    // Continue from part 1, for 40 steps total
    for (let i = 0; i < 30; i++) {
      this.step();
    }

    const counts = this.getCounts();

    const highest = counts.slice(-1)[0];
    const lowest = counts[0];
    const quantityLimitDifference = highest[1] - lowest[1];

    return [`After 40 steps, ${highest[0]} x ${highest[1]} - ${lowest[0]} x ${lowest[1]} = `, quantityLimitDifference];
  }

  step(): void {
    const newPairs: PairMap = {};

    for (const [pair, count] of Object.entries(this.polymerPairs).filter(([, count]) => count > 0)) {
      const [a, b] = this.ruleMap[pair];
      newPairs[a] = (newPairs[a] ?? 0) + count;
      newPairs[b] = (newPairs[b] ?? 0) + count;
    }

    for (const pair of Object.keys(this.polymerPairs)) {
      this.polymerPairs[pair] = newPairs[pair] ?? 0;
    }
  }

  getCounts(): [string, number][] {
    const counts: PairMap = {};

    for (const [pair, count] of Object.entries(this.polymerPairs)) {
      const [a, b] = pair;
      counts[a] = (counts[a] ?? 0) + count;
      counts[b] = (counts[b] ?? 0) + count;
    }

    // Only the first and last chars are not double-counted, so increment them first then divide all by 2
    counts[this.template[0]]++;
    counts[this.template.slice(-1)[0]]++;
    for (const char of Object.keys(counts)) {
      counts[char] /= 2;
    }

    return Object.entries(counts).sort((a, b) => a[1] - b[1]);
  }
}
