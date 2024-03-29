import { Color } from '@framework/color';
import { log } from '@framework/console-util';
import * as fs from 'fs';

const ART_CHAR_WIDTH = 5;
const ART_CHAR_HEIGHT = 6;

const LETTER_MASKS: number[] = [];

(function init(): void {
  const data = fs.readFileSync('framework/ascii-art-letters.txt', { encoding: 'utf8' })
    .split(/\r?\n/)
    .map(line => line.split('').map(c => c !== ' '));

  for (let i = 0; i < 26; i++) {
    LETTER_MASKS.push(getLetterMask(data, i));
  }
})();

const ASCIIArt = {
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

    let text = '';

    // Some letters do not use the full width available, so allow the input to be one column short
    const width = image.reduce((width, line) => Math.max(width, line.length), 0);
    const letterCount = Math.floor((width + 1) / ART_CHAR_WIDTH);
    for (let i = 0; i < letterCount; i++) {
      const mask = getLetterMask(image, i);
      if (mask === 0) {
        text += ' ';
      } else {
        const letterIndex = LETTER_MASKS.indexOf(mask);
        if (letterIndex === -1) {
          console.error(`Unrecognized ASCII art letter (index ${i} / mask ${mask})`);
          text += '?';
        } else {
          text += String.fromCharCode('A'.charCodeAt(0) + letterIndex);
        }
      }
    }

    return text;
  },
};
export default ASCIIArt;

function getLetterMask(image: boolean[][], index: number): number {
  let letterMask = 0;
  const xStart = ART_CHAR_WIDTH * index;

  for (let y = 0; y < image.length; y++) {
    for (let x = xStart; x < xStart + ART_CHAR_WIDTH; x++) {
      letterMask <<= 1;
      if (image[y][x]) {
        letterMask++;
      }
    }
  }

  return letterMask;
}
