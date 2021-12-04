export default {
  title: 'Sonar Sweep',

  part1ExpectedAnswer: 1462,
  solvePart1() {
    this.numbers = this.inputList.map(Number);

    let increases = 0;
    for (let i = 0; i < this.numbers.length - 1; i++) {
      if (this.numbers[i] < this.numbers[i+1]) {
        increases++;
      }
    }
    return ['The depth readings increase {0} times', increases];
  },

  part2ExpectedAnswer: 1497,
  solvePart2() {
    let sum = this.numbers.slice(0, 3).reduce((acc, x) => acc + x, 0)

    let increases = 0;
    for (let i = 3; i < this.numbers.length; i++) {
      const lastSum = sum;
      sum += this.numbers[i] - this.numbers[i-3];
      if (lastSum < sum) {
        increases++;
      }
    }

    return ['The depth windows increase {0} times', increases];
  }
}