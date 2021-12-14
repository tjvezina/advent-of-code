import { readFileSync } from 'fs';
import { log } from './console-util.js';
import { Color } from './color.js';

const ART_CHAR_WIDTH = 5;
const ART_CHAR_HEIGHT = 6;

const LETTER_MASKS: number[] = [];

{
  const data = readFileSync('./ascii-art-letters.txt', { encoding: 'utf8' })
    .split(/\r?\n/)
    .map(line => line.split('').map(c => c !== ' '));

  for (let i = 0; i < 26; i++) {
    LETTER_MASKS.push(getLetterMask(data, i));
  }
}

export const asciiArt = {
  draw(image: boolean[][], doubleWidth = true, color?: Color): void {
    for (let y = 0; y < image.length; y++) {
      const line = image[y];
      for (let x = 0; x < line.length; x++) {
        if (line[x]) {
          log.setBackground(color ?? Color.White);
        }
        log.write(doubleWidth ? '  ' : ' ');
        log.resetBackground();
      }
      log.writeLine();
    }
  },

  imageToText(image: boolean[][]): string {
    if (image.length !== ART_CHAR_HEIGHT) {
      throw new Error(`Image data must be ${ART_CHAR_HEIGHT} rows`);
    }
    if (image.some(line => line.length !== image[0].length)) {
      throw new Error('Image rows must be equal length');
    }

    let text = '';

    // Some letters do not use the full width available, so allow the input to be one column short
    const letterCount = Math.floor((image[0].length + 1) / ART_CHAR_WIDTH);
    for (let i = 0; i < letterCount; i++) {
      const mask = getLetterMask(image, i);
      if (mask === 0) {
        text += ' ';
      } else {
        const letterIndex = LETTER_MASKS.indexOf(mask);
        if (letterIndex === -1) {
          console.error(`Unrecognized ASCII art letter (index ${i})`);
          text += '?';
        } else {
          text += String.fromCharCode('A'.charCodeAt(0) + letterIndex);
        }
      }
    }

    return text;
  },
};

function getLetterMask(image: boolean[][], index: number): number {
  let letterMask = 0;
  const width = image[0].length;
  const xStart = ART_CHAR_WIDTH * index;

  for (let y = 0; y < image.length; y++) {
    for (let x = xStart; x < xStart + ART_CHAR_WIDTH; x++) {
      letterMask <<= 1;
      if (x < width && image[y][x]) {
        letterMask++;
      }
    }
  }

  return letterMask;
}
