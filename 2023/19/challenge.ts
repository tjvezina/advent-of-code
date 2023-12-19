import AbstractChallenge, { Answer } from '@app/abstract-challenge';

type Part = {
  x: number,
  m: number,
  a: number,
  s: number,
}

type Rule = {
  property: keyof Part,
  operator: '<' | '>',
  value: number,
  target: string,
}

type Workflow = {
  rules: Rule[],
  defaultTarget: string,
}

type Limit = { [K in keyof Part]: Part[K] };

type Range = {
  min: Limit,
  max: Limit,
}

const FIRST_WORKFLOW_ID = 'in';
const REJECT_ID = 'R';
const ACCEPT_ID = 'A';

export default class Challenge extends AbstractChallenge {
  title = 'Aplenty';

  partList!: Part[];
  workflowMap = new Map<string, Workflow>();

  init(): void {
    const [workflowInput, partInput] = this.input.split(/(?:\r?\n){2}/);

    workflowInput.split(/\r?\n/).forEach(line => {
      const [, name, rulesStr] = line.match(/(\w+)\{(.*)\}/)!;

      const rulesParts = rulesStr.split(',');
      const defaultTarget = rulesParts.pop()!;
      const rules = rulesParts.map(str => {
        const [, property, operator, valueStr, target] = str.match(/(x|m|a|s)(<|>)(\d+):(\w+)/)!;
        return {
          property: property as Rule['property'],
          operator: operator as Rule['operator'],
          value: parseInt(valueStr),
          target,
        };
      });

      this.workflowMap.set(name, {
        rules,
        defaultTarget,
      });
    });

    this.partList = partInput.split(/\r?\n/).map(line => {
      const [x, m, a, s] = line.match(/(\d+)/g)!.map(x => parseInt(x));
      return { x, m, a, s };
    });
  }

  // --- Part 1 --- //
  part1ExpectedAnswer = 395382;
  solvePart1(): [string, Answer] {
    const inWorkflow = this.workflowMap.get(FIRST_WORKFLOW_ID)!;

    const acceptedPartList = this.partList.filter(part => {
      let workflow = inWorkflow;

      workflowLoop:
      while (true) {
        for (const rule of workflow.rules) {
          if (rule.operator === '<' ? part[rule.property] < rule.value : part[rule.property] > rule.value) {
            if (rule.target === REJECT_ID) return false;
            if (rule.target === ACCEPT_ID) return true;

            workflow = this.workflowMap.get(rule.target)!;
            continue workflowLoop;
          }
        }
        if (workflow.defaultTarget === REJECT_ID) return false;
        if (workflow.defaultTarget === ACCEPT_ID) return true;

        workflow = this.workflowMap.get(workflow.defaultTarget)!;
      }
    });

    const ratingSum = acceptedPartList.map(({ x, m, a, s }) => x + m + a + s).reduce((a, b) => a + b);

    return ['The sum of all accepted part ratings is ', ratingSum];
  }

  // --- Part 2 --- //
  part2ExpectedAnswer = 103557657654583;
  solvePart2(): [string, Answer] {
    const acceptedRangeList: Range[] = [];

    const workflowRangeMap: { workflow: Workflow, range: Range }[] = [{
      workflow: this.workflowMap.get(FIRST_WORKFLOW_ID)!,
      range: { min: { x: 1, m: 1, a: 1, s: 1 }, max: { x: 4000, m: 4000, a: 4000, s: 4000 } },
    }];

    const sendToWorkflow = (range: Range | null, workflowName: string): void => {
      if (range !== null) {
        if (workflowName === ACCEPT_ID) {
          acceptedRangeList.push(range);
        } else if (workflowName !== REJECT_ID) {
          workflowRangeMap.push({
            workflow: this.workflowMap.get(workflowName)!,
            range,
          });
        }
      }
    };

    while (workflowRangeMap.length > 0) {
      const workflowRangeData = workflowRangeMap.shift()!;
      const { workflow } = workflowRangeData;
      let activeRange: Range | null = workflowRangeData.range;

      for (const rule of workflow.rules) {
        if (activeRange === null) {
          break;
        }

        const boundary = (rule.operator === '<' ? rule.value : rule.value + 1);

        let matchedRange: Range | null = null;

        if (activeRange.min[rule.property] < boundary && activeRange.max[rule.property] >= boundary) {
          const rangeLower: Range = { min: { ...activeRange.min }, max: { ...activeRange.max } };
          rangeLower.max[rule.property] = boundary - 1;

          const rangeUpper: Range = { min: { ...activeRange.min }, max: { ...activeRange.max } };
          rangeUpper.min[rule.property] = boundary;

          if (rule.operator === '<') {
            matchedRange = rangeLower;
            activeRange = rangeUpper;
          } else {
            matchedRange = rangeUpper;
            activeRange = rangeLower;
          }
        } else {
          if (rule.operator === '<' ? activeRange.max[rule.property] < boundary : activeRange.min[rule.property] >= boundary) {
            matchedRange = activeRange;
            activeRange = null;
          }
        }

        sendToWorkflow(matchedRange, rule.target);
      }

      sendToWorkflow(activeRange, workflow.defaultTarget);
    }

    const limitKeys = Object.keys(acceptedRangeList[0].min) as (keyof Limit)[];
    const acceptedValueCount = acceptedRangeList
      .map(range => limitKeys.map(key => range.max[key] - range.min[key] + 1).reduce((a, b) => a * b))
      .reduce((a, b) => a + b);

    return ['There are a total of {0} acceptable part rating combinations', acceptedValueCount];
  }
}
