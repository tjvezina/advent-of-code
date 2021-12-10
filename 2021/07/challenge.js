export const challenge = {
  title: 'The Treachery of Whales',

  init() {
    this.positions = this.input.split(',').map(Number);
  },

  // --- Part 1 --- //
  part1ExpectedAnswer: 347011,
  solvePart1() {
    const sortedPositions = [...this.positions].sort((a, b) => a - b);

    const median = (sortedPositions[sortedPositions.length/2 - 1] + sortedPositions[sortedPositions.length/2]) / 2;

    const totalFuel = this.positions.map(pos => Math.abs(pos - median)).reduce((a, b) => a + b);

    return [`The crabs have used {0} fuel after moving to ${median}`, totalFuel];
  },

  // --- Part 2 --- //
  part2ExpectedAnswer: 98363777,
  solvePart2() {
    const mean = this.positions.reduce((a, b) => a + b) / this.positions.length;
    let target = Math.floor(mean); // TODO: Why does flooring the mean give the correct target, instead of rounding it?

    const calculateFuel = function(pos) {
      const steps = Math.abs(pos - target);
      return (steps * (steps + 1)) / 2;
    }

    const totalFuel = this.positions.map(calculateFuel).reduce((a, b) => a + b);

    return [`The crabs have used {0} fuel after moving to ${target}`, totalFuel];
  },
}