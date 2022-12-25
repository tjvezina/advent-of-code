const SNAFU_DIGIT_TO_VALUE = {
  '=': -2,
  '-': -1,
  '0': 0,
  '1': 1,
  '2': 2,
};

const VALUE_TO_SNAFU_DIGIT = {
  0: '0',
  1: '1',
  2: '2',
  3: '=',
  4: '-',
}

export const challenge = {
  title: 'Full of Hot Air',

  init() {
    this.snafuNumbers = this.input.split(/\r?\n/);
  },

  // --- Part 1 --- //
  part1ExpectedAnswer: '2=10---0===-1--01-20',
  solvePart1() {
    const sum = this.snafuNumbers.map(snafuToDecimal).reduce((a, b) => a + b);

    const totalSnafu = decimalToSnafu(sum);

    return ['The SNAFU total is ', totalSnafu];
  },

  // --- Part 2 --- //
  part2ExpectedAnswer: 'a very young Elf',
  solvePart2() { return ['The final star is provided by {0} from the expedition team!', this.part2ExpectedAnswer]; },
}

function snafuToDecimal(snafu) {
  let decimal = 0;

  for (let i = 0; i < snafu.length; i++) {
    const c = snafu[snafu.length - 1 - i];

    decimal += Math.pow(5, i) * SNAFU_DIGIT_TO_VALUE[c];
  }

  return decimal;
}

function decimalToSnafu(decimal) {
  let snafu = '';

  const base5 = decimal.toString(5);
  
  let carry = 0;
  for (let i = 0; i < base5.length; i++) {
    const value = parseInt(base5[base5.length - 1 - i]) + carry;

    snafu = VALUE_TO_SNAFU_DIGIT[value % 5] + snafu;
    carry = (value <= 2 ? 0 : 1);
  }

  return snafu;
}