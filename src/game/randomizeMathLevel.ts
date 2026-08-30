// src/game/randomizeMathLevel.ts — 数学关参数随机（JSON 仅模板：emoji + 运算符）

import type { MathChoiceDef, MathStoryLevelDef, MathStoryRoll } from '../state/types';

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function rollCounts(template: MathStoryLevelDef): MathStoryRoll {
  const emoji = template.left.emoji || template.right.emoji;
  if (template.operator === '+') {
    const leftCount = randInt(1, 4);
    const rightCount = randInt(1, 4);
    return {
      operator: '+',
      left: { emoji, count: leftCount },
      right: { emoji, count: rightCount },
      correctValue: leftCount + rightCount,
    };
  }
  const leftCount = randInt(2, 6);
  const rightCount = randInt(1, leftCount - 1);
  return {
    operator: '-',
    left: { emoji, count: leftCount },
    right: { emoji, count: rightCount },
    correctValue: leftCount - rightCount,
  };
}

function buildDistractors(correct: number): number[] {
  const values = new Set<number>([correct]);
  const candidates = [
    correct - 2,
    correct - 1,
    correct + 1,
    correct + 2,
    correct + 3,
  ].filter((n) => n >= 0 && n <= 10);
  for (const n of candidates) {
    if (values.size >= 3) break;
    values.add(n);
  }
  let guard = 0;
  while (values.size < 3 && guard++ < 32) {
    values.add(randInt(0, Math.min(10, correct + 4)));
  }
  return [...values].slice(0, 3);
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function rollMathStory(template: MathStoryLevelDef): {
  roll: MathStoryRoll;
  choices: MathChoiceDef[];
  correctChoiceId: string;
} {
  const roll = rollCounts(template);
  const values = shuffle(buildDistractors(roll.correctValue));
  const choices: MathChoiceDef[] = values.map((value, i) => ({
    id: `r${i}`,
    label: String(value),
    value,
  }));
  const correctChoiceId = choices.find((c) => c.value === roll.correctValue)!.id;
  return { roll, choices, correctChoiceId };
}
