// A modulo operation that handles negative numbers (ex. -2 % 3 = 1)
export function mod(x: number, n: number): number {
  return ((x % n) + n) % n;
}

// Greatest common divisor
export function gcd(a: number, b: number): number {
  while (b > 0) {
    [a, b] = [b, a];
    b %= a;
  }
  return a;
}
