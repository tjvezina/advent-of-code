const PART_1_DAYS = 80;
const PART_2_DAYS = 256;

export const challenge = {
  title: 'Lanternfish',

  init() {
    this.initialTimers = this.input.split(',').map(Number);
  },

  // --- Part 1 --- //
  part1ExpectedAnswer: 379114,
  solvePart1() {
    const totalFish = this.simulate(PART_1_DAYS);

    return [`After ${PART_1_DAYS} days, there are {0} lanternfish`, totalFish];
  },

  // --- Part 2 --- //
  part2ExpectedAnswer: 1702631502303,
  solvePart2() {
    const totalFish = this.simulate(PART_2_DAYS);

    return [`After ${PART_2_DAYS} days, there are {0} lanternfish`, totalFish];
  },

  simulate(days) {
    const timerCounts = new Array(9).fill(0);
    this.initialTimers.forEach(timer => timerCounts[timer]++);

    for (let i = 0; i < days; i++) {
      const zeros = timerCounts.shift();
      timerCounts.push(zeros);
      timerCounts[6] += zeros;
    }

    return timerCounts.reduce((a, b) => a + b);
  },
}