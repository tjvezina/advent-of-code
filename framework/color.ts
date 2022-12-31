function hexToRGB(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function validate(value: number): number {
  return Math.round(Math.max(0, Math.min(255, value)));
}

export class Color {
  // Standard 4-bit ANSI colors
  static Black = Color.fromHex('#000000');
  static DarkRed = Color.fromHex('#921313');
  static DarkYellow = Color.fromHex('#be9e0d');
  static DarkGreen = Color.fromHex('#198f15');
  static DarkCyan = Color.fromHex('#1e7b97');
  static DarkBlue = Color.fromHex('#0726b1');
  static DarkMagenta = Color.fromHex('#8d0d8d');
  static DarkGray = Color.fromHex('#767676');
  static Gray = Color.fromHex('#CCCCCC');
  static Red = Color.fromHex('#d81313');
  static Yellow = Color.fromHex('#FFE700');
  static Green = Color.fromHex('#1ed314');
  static Cyan = Color.fromHex('#33d6d6');
  static Blue = Color.fromHex('#1566d1');
  static Magenta = Color.fromHex('#d80dd8');
  static White = Color.fromHex('#ffffff');

  r = 0;
  g = 0;
  b = 0;

  static fromRGB(r: number, g: number, b: number): Color {
    const color = new Color();
    color.r = validate(r);
    color.g = validate(g);
    color.b = validate(b);
    return color;
  }

  static fromHex(hex: string): Color {
    return Color.fromRGB(...hexToRGB(hex));
  }

  toHex(): string {
    return '#' +
      this.r.toString(16).padStart(2, '0') +
      this.g.toString(16).padStart(2, '0') +
      this.b.toString(16).padStart(2, '0');
  }

  mult(factor: number): void {
    this.r = validate(this.r * factor);
    this.g = validate(this.g * factor);
    this.b = validate(this.b * factor);
  }
}

Object.freeze(Color.Black);
Object.freeze(Color.DarkRed);
Object.freeze(Color.DarkYellow);
Object.freeze(Color.DarkGreen);
Object.freeze(Color.DarkCyan);
Object.freeze(Color.DarkBlue);
Object.freeze(Color.DarkMagenta);
Object.freeze(Color.DarkGray);
Object.freeze(Color.Gray);
Object.freeze(Color.Red);
Object.freeze(Color.Yellow);
Object.freeze(Color.Green);
Object.freeze(Color.Cyan);
Object.freeze(Color.Blue);
Object.freeze(Color.Magenta);
Object.freeze(Color.White);
