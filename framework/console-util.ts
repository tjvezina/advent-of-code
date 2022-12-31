import { Color } from './color.js';

type FontOptions = {
  bold?: boolean,
  italic?: boolean,
  underline?: boolean,
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
  get width(): number {
    return process.stdout.columns;
  },

  get height(): number {
    return process.stdout.rows;
  },

  write(msg?: unknown): void { process.stdout.write(msg === undefined ? '' : `${msg}`); },
  writeLine(msg?: unknown): void { process.stdout.write((msg === undefined ? '' : `${msg}`) + '\n'); },

  // Allow assigning an empty function to disable stdout
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disableStdout(): void { process.stdout.write = function (): void { }; },
  enableStdout(): void { process.stdout.write = defaultWriteFunc; },

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

  moveCursor(x: number, y: number): void { process.stdout.moveCursor(x, y); },

  clearLine(): void { process.stdout.clearLine(0); },
  clearScreenBelow(): void { process.stdout.clearScreenDown(); },
  clearScreen(): void {
    process.stdout.cursorTo(0, 0);
    this.clearScreenBelow();
  },

  async waitForKey(): Promise<void> {
    process.stdin.resume();
    process.stdin.setRawMode(true);
    return new Promise(resolve => process.stdin.once('data', (buffer: string) => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      if (`${buffer}`.charCodeAt(0) === 3) {
        process.exit();
      }
      resolve();
    }));
  },
};
