export default {
  title: 'Sonar Sweep',

  initInput(inputText) {
    this.input = inputText.split(/\r?\n/).map(Number);
  },

  // --- Part 1 --- //
  part1ExpectedAnswer: 1462,
  solvePart1() {
    let increases = 0;
    for (let i = 0; i < this.input.length - 1; i++) {
      if (this.input[i] < this.input[i+1]) {
        increases++;
      }
    }
    return ['The depth readings increase {0} times', increases];
  },

  // --- Part 2 --- //
  part2ExpectedAnswer: 1497,
  solvePart2() {
    let sum = this.input.slice(0, 3).reduce((acc, x) => acc + x, 0)

    let increases = 0;
    for (let i = 3; i < this.input.length; i++) {
      const lastSum = sum;
      sum += this.input[i] - this.input[i-3];
      if (lastSum < sum) {
        increases++;
      }
    }

    return ['The depth windows increase {0} times', increases];
  }
}