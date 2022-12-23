export function gcd(a: number, b: number) {
  while (b > 0) {
    [a, b] = [b, a];
    b %= a;
  }
  return a;
}