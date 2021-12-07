// Values correspond to ANSI excape codes, where background colors = foreground + 10
export enum ConsoleColor {
  Black = 30,
  DarkRed = 31,
  DarkGreen = 32,
  DarkYellow = 33,
  DarkBlue = 34,
  DarkMagenta = 35,
  DarkCyan = 36,
  Gray = 37,
  DarkGray = 90,
  Red = 91,
  Green = 92,
  Yellow = 93,
  Blue = 94,
  Magenta = 95,
  Cyan = 96,
  White = 97,
};

const foregroundStack: ConsoleColor[] = [];
const backgroundStack: ConsoleColor[] = [];

const defaultWriteFunc = process.stdout.write;

export const log = {
  write(msg?: any) { process.stdout.write(msg === undefined ? '' : `${msg}`); },
  writeLine(msg?: any) { process.stdout.write((msg === undefined ? '' : `${msg}`) + '\n'); },
  
  // @ts-ignore: Allow assigning an empty function to disable stdout
  disableStdout() { process.stdout.write = function () {}; },
  enableStdout() { process.stdout.write = defaultWriteFunc; },
  
  setForeground(color: ConsoleColor) { process.stdout.write(`\u001b[${color}m`); },
  setBackground(color: ConsoleColor) { process.stdout.write(`\u001b[${color + 10}m`); },
  
  setColors(fg: ConsoleColor, bg: ConsoleColor) { process.stdout.write(`\u001b[${fg};${bg + 10}m`); },
  
  resetColors() { process.stdout.write('\u001b[0m'); },
  
  pushForeground(color: ConsoleColor) {
    foregroundStack.push(color);
    this.setForeground(color);
  },
  
  popForeground() {
    foregroundStack.pop();
    const lastForeground = foregroundStack.slice(-1)[0];
  
    if (lastForeground !== undefined) {
      this.setForeground(lastForeground);
    } else {
      this.resetColors();
      if (backgroundStack.length > 0) {
        this.setBackground(backgroundStack.slice(-1)[0]);
      }
    }
  },
  
  pushBackground(color: ConsoleColor) {
    backgroundStack.push(color);
    this.setBackground(color);
  },
  
  popBackground() {
    backgroundStack.pop();
    const lastBackground = backgroundStack.slice(-1)[0];
  
    if (lastBackground !== undefined) {
      this.setBackground(lastBackground);
    } else {
      this.resetColors();
      if (foregroundStack.length > 0) {
        this.setForeground(foregroundStack.slice(-1)[0]);
      }
    }
  },
};

// export function write(msg?: string) { process.stdout.write(msg ?? ''); }
// export function writeLine(msg?: string) { process.stdout.write((msg ?? '') + '\n'); }

// // @ts-ignore: Allow assigning an empty function to disable stdout
// export function disableStdout() { process.stdout.write = function () {}; }
// export function enableStdout() { process.stdout.write = defaultWriteFunc; }

// export function setForeground(color: Color) { process.stdout.write(`\u001b[${color}m`); }
// export function setBackground(color: Color) { process.stdout.write(`\u001b[${color + 10}m`); }

// export function setColors(fg: Color, bg: Color) { process.stdout.write(`\u001b[${fg};${bg + 10}m`); }

// export function resetColors() { process.stdout.write('\u001b[0m'); }

// export function pushForeground(color: Color) {
//   foregroundStack.push(color);
//   setForeground(color);
// }

// export function popForeground() {
//   foregroundStack.pop();
//   const lastForeground = foregroundStack.slice(-1)[0];

//   if (lastForeground !== undefined) {
//     setForeground(lastForeground);
//   } else {
//     resetColors();
//     if (backgroundStack.length > 0) {
//       setBackground(backgroundStack.slice(-1)[0]);
//     }
//   }
// }

// export function pushBackground(color: Color) {
//   backgroundStack.push(color);
//   setBackground(color);
// }

// export function popBackground() {
//   backgroundStack.pop();
//   const lastBackground = backgroundStack.slice(-1)[0];

//   if (lastBackground !== undefined) {
//     setBackground(lastBackground);
//   } else {
//     resetColors();
//     if (foregroundStack.length > 0) {
//       setForeground(foregroundStack.slice(-1)[0]);
//     }
//   }
// }
