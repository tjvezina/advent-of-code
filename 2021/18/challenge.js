export const challenge = {
  title: 'Snailfish',

  init() {
    this.snailfishNumbers = this.input.split(/\r?\n/);
  },

  // --- Part 1 --- //
  part1ExpectedAnswer: 3305,
  solvePart1() {
    const snailfishSum = this.snailfishNumbers.reduce(snailfishAdd);

    return [`The magnitude of sum ${snailfishSum} is `, getMagnitude(snailfishSum)];
  },

  // --- Part 2 --- //
  part2ExpectedAnswer: 4563,
  solvePart2() {
    const max = { value: 0 };
    for (let i = 0; i < this.snailfishNumbers.length; i++) {
      for (let j = 0; j < this.snailfishNumbers.length; j++) {
        if (i !== j) {
          const magnitude = getMagnitude(snailfishAdd(this.snailfishNumbers[i], this.snailfishNumbers[j]));

          if (magnitude > max.value) {
            max.value = magnitude;
            max.i = i;
            max.j = j;
          }
        }
      }
    }

    return [`The greatest magnitude, between #${max.i} and #${max.j}, is `, max.value];
  },
}

function snailfishAdd(a, b) {
  let pair = `[${a},${b}]`;

  addLoop:
  while (true) {
    // Check for any leaf pairs nested 4 or more levels deep
    let depth = 0;
    for (let i = 0; i < pair.length; i++) {
      if (pair[i] === '[') depth++;
      if (pair[i] === ']') depth--;
      if (depth > 4 && !pair.slice(i+1, pair.indexOf(']', i+1)).includes('[')) {
        pair = explode(pair, i);
        continue addLoop;
      }
    }

    // Check for any values with 2 or more digits
    const match = pair.match(/\d{2,}/);
    if (match !== null) {
      pair = split(pair, match.index, match[0]);
      continue;
    }

    break;
  }

  return pair;
}

function explode(pair, i) {
  const iEnd = pair.indexOf(']', i);
  const [a, b] = pair.slice(i+1, iEnd).match(/\d+/g).map(Number);
  let pairStart = pair.slice(0, i);
  let pairEnd = pair.slice(iEnd+1);

  const lastNumberInStart = pairStart.match(/\d+/g)?.pop();
  if (lastNumberInStart !== undefined) {
    const iLastNumber = pairStart.lastIndexOf(lastNumberInStart);
    pairStart = pairStart.slice(0, iLastNumber) + `${Number(lastNumberInStart) + a}` + pairStart.slice(iLastNumber + lastNumberInStart.length);
  }

  const firstNumberInEnd = pairEnd.match(/\d+/g)?.[0];
  if (firstNumberInEnd !== undefined) {
    const iFirstNumber = pairEnd.indexOf(firstNumberInEnd);
    pairEnd = pairEnd.slice(0, iFirstNumber) + `${Number(firstNumberInEnd) + b}` + pairEnd.slice(iFirstNumber + firstNumberInEnd.length);
  }

  return pairStart + '0' + pairEnd;
}

function split(pair, i, number) {
  const a = Math.floor(Number(number) / 2);
  const b = Math.ceil(Number(number) / 2);

  return pair.slice(0, i) + `[${a},${b}]` + pair.slice(i + number.length);
}

function getMagnitude(pair) {
  let iComma;
  let depth = 0;
  for (let i = 1; i < pair.length - 1; i++) {
    if (pair[i] === '[') depth++;
    if (pair[i] === ']') depth--;
    if (pair[i] === ',' && depth === 0) {
      iComma = i;
      break;
    }
  }

  const left = pair.slice(1, iComma);
  const right = pair.slice(iComma+1, pair.length-1);

  const a = (left[0] === '[' ? getMagnitude(left) : Number(left));
  const b = (right[0] === '[' ? getMagnitude(right) : Number(right));

  return 3*a + 2*b;
}
