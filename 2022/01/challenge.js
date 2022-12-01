export const challenge = {
  title: 'Calorie Counting',

  init() {
    this.calorieLists = [[]];

    this.input.split(/\r?\n/).map(x => parseInt(x)).forEach(value => {
      if (isNaN(value)) {
        this.calorieLists.push([]);
      } else {
        this.calorieLists.slice(-1)[0].push(value);
      }
    })
  },

  // --- Part 1 --- //
  part1ExpectedAnswer: 68923,
  solvePart1() {
    const calorieTotals = this.calorieLists.map(list => list.reduce((a, b) => a + b));
    const maxCalories = calorieTotals.reduce((a, b) => a > b ? a : b);

    return ['The highest calorie count is ', maxCalories];
  },

  // --- Part 2 --- //
  part2ExpectedAnswer: 200044,
  solvePart2() {
    const calorieTotals = this.calorieLists.map(list => list.reduce((a, b) => a + b));
    const topThreeSum = calorieTotals.sort((a, b) => a - b).slice(-3).reduce((a, b) => a + b)

    return ['The total calories carried by the top 3 elves is ', topThreeSum];
  },
}