import AbstractChallenge, { Answer } from '@app/abstract-challenge';
import Maths from '@framework/maths';

enum Pulse { Low, High }

class Module {
  id: string;
  outputList: Module[] = [];

  constructor(id: string) {
    this.id = id;
  }
}

class FlipFlop extends Module {
  state = Pulse.Low;
}

class Conjunction extends Module {
  inputStateMap = new Map<Module, Pulse>();

  addInputModules(moduleList: Module[]): void {
    for (const module of moduleList) {
      this.inputStateMap.set(module, Pulse.Low);
    }
  }

  get outputPulse(): Pulse {
    return ([...this.inputStateMap.values()].every(pulse => pulse === Pulse.High) ? Pulse.Low : Pulse.High);
  }
}

const BUTTON_ID = 'button';
const BROADCASTER_ID = 'broadcaster';
const RX_ID = 'rx';

export default class Challenge extends AbstractChallenge {
  title = 'Pulse Propagation';

  buttonModule!: Module;
  moduleList!: Module[];

  init(): void {
    const lines = this.input.split(/\r?\n/);

    const parseInput = (line: string): { id: string, outputIDList: string[] } => {
      const [id, outputIDListStr] = line.split(' -> ');
      return { id: (id === BROADCASTER_ID ? id : id.substring(1)), outputIDList: outputIDListStr.split(', ') };
    };

    // Parse input strings into data
    const broadcasterData = parseInput(lines.find(line => line.startsWith(BROADCASTER_ID))!);
    const flipFlopDataList = lines.filter(line => line.startsWith('%')).map(parseInput);
    const conjunctionDataList = lines.filter(line => line.startsWith('&')).map(parseInput);

    // Create all module objects
    const moduleMap = new Map<string, Module>();

    moduleMap.set(BROADCASTER_ID, new Module(BROADCASTER_ID));
    moduleMap.set(RX_ID, new Module(RX_ID));
    flipFlopDataList.forEach(({ id }) => moduleMap.set(id, new FlipFlop(id)));
    conjunctionDataList.forEach(({ id }) => moduleMap.set(id, new Conjunction(id)));

    this.moduleList = [...moduleMap.values()];

    // Populate input/output lists with module references
    [broadcasterData, ...flipFlopDataList, ...conjunctionDataList].forEach(({ id, outputIDList }) => {
      moduleMap.get(id)!.outputList = outputIDList.map(outputID => moduleMap.get(outputID)!);
    });

    conjunctionDataList.forEach(({ id }) => {
      const conjunction = moduleMap.get(id) as Conjunction;
      conjunction.addInputModules(this.moduleList.filter(module => module.outputList.includes(conjunction)));
    });

    this.buttonModule = new Module(BUTTON_ID);
    this.buttonModule.outputList = [moduleMap.get(BROADCASTER_ID)!];
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 873301506;
  solvePart1(): [string, Answer] {
    let totalLowPulseCount = 0;
    let totalHighPulseCount = 0;

    for (let i = 0; i < 1000; i++) {
      const { lowPulseCount, highPulseCount } = this.pushTheButton();
      totalLowPulseCount += lowPulseCount;
      totalHighPulseCount += highPulseCount;
    }

    const pulseProduct = totalLowPulseCount * totalHighPulseCount;
    return [`${totalLowPulseCount} low pulses x ${totalHighPulseCount} high pulses = `, pulseProduct];
  }

  reset(): void {
    this.moduleList.forEach(module => {
      if (module instanceof FlipFlop) {
        module.state = Pulse.Low;
      } else if (module instanceof Conjunction) {
        for (const inputModule of [...module.inputStateMap.keys()]) {
          module.inputStateMap.set(inputModule, Pulse.Low);
        }
      }
    });
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 241823802412393;
  solvePart2(): [string, Answer] {
    // The input has a very special shape, forming 4 counters that effectively count up to a specific value repeatedly
    // The 'rx' module will receive a low pulse when all 4 counters "roll over" to zero at the same time (LCM of all values)
    const counterValueList: number[] = this.buttonModule.outputList[0]!.outputList.map(module => {
      const conjunction = module.outputList.find(outputModule => outputModule instanceof Conjunction)!;

      const flipFlopChain = [module];
      let nextFlipFlop: Module | undefined = module;
      while (nextFlipFlop !== undefined) {
        nextFlipFlop = nextFlipFlop.outputList.find(outputModule => outputModule instanceof FlipFlop);
        if (nextFlipFlop !== undefined) {
          flipFlopChain.push(nextFlipFlop);
        }
      }

      const binaryStr = flipFlopChain.reverse().map(module => (module.outputList.includes(conjunction) ? '1' : '0')).join('');
      return parseInt(binaryStr, 2);
    });

    const buttonPushCount = Maths.lcm(...counterValueList);

    return ['The button was pushed {0} times before rx received the correct pulse', buttonPushCount];
  }

  pushTheButton({ trackRXModuleOnly }: { trackRXModuleOnly?: boolean } = {}): { lowPulseCount: number, highPulseCount: number } {
    let lowPulseCount = 0;
    let highPulseCount = 0;

    const queue = [{ module: this.buttonModule, pulse: Pulse.Low }];

    while (queue.length > 0) {
      const { module, pulse } = queue.shift()!;

      for (const outputModule of module.outputList) {
        if (!trackRXModuleOnly || outputModule.id === RX_ID) {
          if (pulse === Pulse.Low) {
            lowPulseCount++;
          } else {
            highPulseCount++;
          }
        }
        // console.log(`${module.id} -${pulse?'high':'low'}-> ${outputModule.id}`);
        if (outputModule instanceof FlipFlop) {
          if (pulse === Pulse.Low) {
            outputModule.state = (outputModule.state === Pulse.Low ? Pulse.High : Pulse.Low);
            queue.push({ module: outputModule, pulse: outputModule.state });
          }
        } else if (outputModule instanceof Conjunction) {
          outputModule.inputStateMap.set(module, pulse);
          queue.push({ module: outputModule, pulse: outputModule.outputPulse });
        } else {
          queue.push({ module: outputModule, pulse });
        }
      }
    }

    return { lowPulseCount, highPulseCount };
  }
}
