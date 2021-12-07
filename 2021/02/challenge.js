export const challenge = {
  title: 'Dive!',

  init() {
    this.instructions = this.input.split(/\r?\n/);
  },

  // --- Part 1 --- //
  part1ExpectedAnswer: 2070300,
  solvePart1() {
    let pos = { x: 0, y: 0 };

    for (const step of this.instructions) {
      const [ dir, dist ] = step.split(' ');

      switch (dir) {
        case 'forward': pos.x += Number(dist); break;
        case 'down':    pos.y += Number(dist); break;
        case 'up':      pos.y -= Number(dist); break;
        default:
          console.error('Unknown direction:', dir);
      }
    }

    return [`${pos.x} forward x ${pos.y} down = `, pos.x * pos.y];
  },

  // --- Part 2 --- //
  part2ExpectedAnswer: 2078985210,
  solvePart2() {
    let pos = { x: 0, y: 0 };
    let aim = 0;

    for (const step of this.instructions) {
      const [ dir, distStr ] = step.split(' ');
      const dist = Number(distStr);

      switch (dir) {
        case 'down':    aim += dist; break;
        case 'up':      aim -= dist; break;
        case 'forward':
          pos.x += dist;
          pos.y += dist * aim;
          break;
        default:
          console.error('Unknown direction:', dir);
      }
    }

    return [`${pos.x} forward x ${pos.y} down = `, pos.x * pos.y];
  }
}