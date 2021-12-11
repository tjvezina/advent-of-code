import { Color } from './color.js';

type FontOptions = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

type ColorArg = Color | string;

const defaultWriteFunc = process.stdout.write;

function parseColorArg(arg: ColorArg): Color {
  if (Object.getPrototypeOf(arg) === Color.prototype) {
    return arg as Color;
  }
  return Color.fromHex(arg as string);
}

export const log = {
  write(msg?: any) { process.stdout.write(msg === undefined ? '' : `${msg}`); },
  writeLine(msg?: any) { process.stdout.write((msg === undefined ? '' : `${msg}`) + '\n'); },
  
  // @ts-ignore: Allow assigning an empty function to disable stdout
  disableStdout() { process.stdout.write = function () {}; },
  enableStdout() { process.stdout.write = defaultWriteFunc; },

  setForeground(arg: ColorArg, options?: FontOptions): void {
    const color = parseColorArg(arg);
    const optionsStr = (options?.bold ? ';1' : ';22') + (options?.italic ? ';3' : ';23') + (options?.underline ? ';4' : ';24');
    process.stdout.write(`\u001b[38;2;${color.r};${color.g};${color.b}${optionsStr}m`);
  },

  resetForeground(): void { process.stdout.write('\u001b[39;22;23;24m'); },

  setBackground(arg: ColorArg): void {
    const color = parseColorArg(arg);
    process.stdout.write(`\u001b[48;2;${color.r};${color.g};${color.b}m`);
  },

  resetBackground(): void { process.stdout.write('\u001b[49m'); },

  setColors(fg: ColorArg, bg: ColorArg, options?: FontOptions): void {
    this.setForeground(fg, options);
    this.setBackground(bg);
  },

  resetColors(): void { process.stdout.write('\u001b[0m'); },
};
