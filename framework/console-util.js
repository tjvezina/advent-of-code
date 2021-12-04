// Values correspond to ANSI excape codes, where background colors = foreground + 10
export const color = {
  black: 30,
  darkRed: 31,
  darkGreen: 32,
  darkYellow: 33,
  darkBlue: 34,
  darkMagenta: 35,
  darkCyan: 36,
  gray: 37,
  darkGray: 90,
  red: 91,
  green: 92,
  yellow: 93,
  blue: 94,
  magenta: 95,
  cyan: 96,
  white: 97,
};

const foregroundStack = [];
const backgroundStack = [];

export function setForeground(color) { process.stdout.write(`\u001b[${color}m`); }
export function setBackground(color) { process.stdout.write(`\u001b[${color + 10}m`); }

export function setColors(fg, bg) { process.stdout.write(`\u001b[${fg};${bg + 10}m`); }

export function resetColors() { process.stdout.write('\u001b[0m'); }

export function pushForeground(color) {
  foregroundStack.push(color);
  setForeground(color);
}

export function popForeground() {
  foregroundStack.pop();
  const lastForeground = foregroundStack.slice(-1)[0];

  if (lastForeground !== undefined) {
    setForeground(lastForeground);
  } else {
    resetColors();
    if (backgroundStack.length > 0) {
      setBackground(backgroundStack.slice(-1)[0]);
    }
  }
}

export function pushBackground(color) {
  backgroundStack.push(color);
  setBackground(color);
}

export function popBackground() {
  backgroundStack.pop();
  const lastBackground = backgroundStack.slice(-1)[0];

  if (lastBackground !== undefined) {
    setBackground(lastBackground);
  } else {
    resetColors();
    if (foregroundStack.length > 0) {
      setForeground(foregroundStack.slice(-1)[0]);
    }
  }
}
