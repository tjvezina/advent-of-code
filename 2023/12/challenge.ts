import AbstractChallenge, { Answer } from '@app/abstract-challenge';

type HotSpringRow = {
  springs: string,
  groups: number[],
}

export default class Challenge extends AbstractChallenge {
  title = 'Hot Springs';

  rows!: HotSpringRow[];

  cache: Map<string, number> = new Map();

  init(): void {
    const lines = this.input.split(/\r?\n/);

    this.rows = lines.map(line => {
      const [springs, groupsStr] = line.split(' ');
      return {
        springs,
        groups: groupsStr.match(/\d+/g)!.map(match => parseInt(match)),
      };
    });
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 7506;
  solvePart1(): [string, Answer] {
    const arrangementsList = this.rows.map(this.getArrangements.bind(this));

    const arrangementSum = arrangementsList.map(arrangements => arrangements.length).reduce((a, b) => a + b);
    return ['There are {0} total possible row arrangements', arrangementSum];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 548241300348335;
  solvePart2(): [string, Answer] {
    const unfoldedRows = this.rows.map(row => ({
      springs: new Array<string>(5).fill(row.springs).join('?'),
      groups: new Array<number[]>(5).fill([...row.groups]).flatMap(x => x),
    }));

    const arrangementCountList = unfoldedRows.map(this.getArrangementCountCached.bind(this));

    const arrangementSum = arrangementCountList.reduce((a, b) => a + b);
    return ['There are {0} total possible unfolded row arrangements', arrangementSum];
  }

  getArrangements(row: HotSpringRow): string[] {
    const arrangements: string[] = [];

    const allGroups = row.groups.map(group => '#'.repeat(group)).join('.');
    let next = allGroups + '.'.repeat(row.springs.length - allGroups.length);

    do {
      if ([...row.springs].every((c, i) => c === '?' || c === next[i])) {
        arrangements.push(next);
      }

      const moveableGroupMatches = [...next.matchAll(/(#+)(\.+)(?:\.|$)/g)];
      if (moveableGroupMatches.length === 0) {
        break;
      }

      const lastMoveableGroupMatch = moveableGroupMatches.at(-1)!;
      const iLastGroup = lastMoveableGroupMatch.index!;
      const [, group, space] = lastMoveableGroupMatch;

      // Remove the normal springs after the group, resetting any later ones
      next = `${next.slice(0, iLastGroup + group.length)}${next.slice(iLastGroup + group.length + space.length)}`;

      // Insert a normal spring before the group, moving it forward
      next = `${next.slice(0, iLastGroup)}.${next.slice(iLastGroup)}`;

      // Replace any missing normal springs at the end of the row
      next += '.'.repeat(row.springs.length - next.length);
    } while (true);

    return arrangements;
  }

  getArrangementCountCached(row: HotSpringRow): number {
    const cacheKey = `${row.springs} ${row.groups.join(',')}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const arrangementCount = this.getArrangementCount(row);
    this.cache.set(cacheKey, arrangementCount);
    return arrangementCount;
  }

  getArrangementCount(row: HotSpringRow): number {
    const { springs, groups } = row;

    // If there are no groups left and no damaged springs left, we've found a valid arrangement
    if (groups.length === 0) {
      return springs.includes('#') ? 0 : 1;
    }

    // No springs to work with
    if (springs.length === 0) {
      return 0;
    }

    // Trim leading normal springs to simplify and continue...
    if (springs[0] === '.') {
      return this.getArrangementCount({ springs: springs.replace(/^\.+/, ''), groups });
    }

    // Branch on leading unknowns, checking both possibilities
    if (springs[0] === '?') {
      const subsprings = springs.substring(1);
      return this.getArrangementCountCached({ springs: `${subsprings}`, groups }) +
             this.getArrangementCountCached({ springs: `#${subsprings}`, groups });
    }

    // Not enough springs for the required group size
    if (springs.length < groups[0]) {
      return 0;
    }

    // No normal springs can appear in the group of damaged springs
    if (springs.substring(0, groups[0]).includes('.')) {
      return 0;
    }

    if (groups.length > 1) {
      // No room for the next group
      if (springs.length < groups[0] + 2) {
        return 0;
      }

      // There must be a normal spring after the group
      if (springs[groups[0]] === '#') {
        return 0;
      }

      return this.getArrangementCount({ springs: springs.substring(groups[0] + 1), groups: groups.slice(1) });
    }

    return this.getArrangementCount({ springs: springs.substring(groups[0]), groups: groups.slice(1) });
  }
}
