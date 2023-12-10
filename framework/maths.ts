const Maths = {
  // A modulo operation that handles negative numbers (ex. -2 % 3 = 1)
  mod(x: number, n: number): number {
    return ((x % n) + n) % n;
  },

  // Greatest common divisor
  gcd(...values: number[]): number {
    return values.reduce((a, b) => {
      while (b > 0) {
        [a, b] = [b, a];
        b %= a;
      }
      return a;
    });
  },

  // Lowest common multiple
  lcm(...values: number[]): number {
    return values.reduce((a, b) => a * b / Maths.gcd(a, b));
  },
};
export default Maths;
