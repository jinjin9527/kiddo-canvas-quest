// src/game/layoutCampaign2.ts — 战役2 · 08 固定答题卡布局

import { layoutAnswerChoices, layoutCampaign2Bands, spawnBelowCard } from './campaign2CardLayout';
import { rollMathStory } from './randomizeMathLevel';
import type { Campaign2LevelDef, Campaign2ChoicePlaced, GameState } from '../state/types';

function kanaChoiceLabel(def: Extract<Campaign2LevelDef, { kind: 'kana_fill' }>, choiceId: string): string {
  return def.options.find((c) => c.id === choiceId)?.glyph ?? '?';
}

function kanaCorrectChoiceId(def: Extract<Campaign2LevelDef, { kind: 'kana_fill' }>): string {
  const glyph = [...def.word][def.gapIndex];
  const hit = def.options.find((c) => c.glyph === glyph);
  if (!hit) throw new Error(`kana level ${def.id}: no matching glyph`);
  return hit.id;
}

function layoutFixedCard(
  state: GameState,
  optionLabels: { id: string; label: string }[],
): { choices: Campaign2ChoicePlaced[]; spawn: { x: number; y: number } } {
  const bands = layoutCampaign2Bands(state.canvas);
  const choices = layoutAnswerChoices(bands.answerCard, optionLabels);
  const spawn = spawnBelowCard(state.canvas, bands.answerCard, state.player.size);
  return { choices, spawn };
}

export function beginCampaign2Play(state: GameState, index: number): GameState {
  if (!state.campaign2) return state;
  const def = state.campaign2.definitions[index];
  if (!def) return state;

  if (def.kind === 'math_story') {
    const { roll, choices, correctChoiceId } = rollMathStory(def);
    const labels = choices.map((c) => ({ id: c.id, label: c.label }));
    const { choices: placed, spawn } = layoutFixedCard(state, labels);
    return {
      ...state,
      scene: 'PLAY',
      campaignId: 'campaign2',
      level: null,
      campaign2: {
        ...state.campaign2,
        currentIndex: index,
        phase: 'play',
        lastResult: 'none',
        feedbackTimer: 0,
        correctChoiceId,
        choices: placed,
        mathRoll: roll,
      },
      player: {
        ...state.player,
        position: { x: spawn.x, y: spawn.y },
        velocity: { x: 0, y: 0 },
      },
    };
  }

  const labels = def.options.map((opt) => ({
    id: opt.id,
    label: kanaChoiceLabel(def, opt.id),
  }));
  const { choices, spawn } = layoutFixedCard(state, labels);

  return {
    ...state,
    scene: 'PLAY',
    campaignId: 'campaign2',
    level: null,
    campaign2: {
      ...state.campaign2,
      currentIndex: index,
      phase: 'play',
      lastResult: 'none',
      feedbackTimer: 0,
      correctChoiceId: kanaCorrectChoiceId(def),
      choices,
      mathRoll: null,
    },
    player: {
      ...state.player,
      position: { x: spawn.x, y: spawn.y },
      velocity: { x: 0, y: 0 },
    },
  };
}

export function relayoutCampaign2IfPlaying(state: GameState): GameState {
  if (state.scene !== 'PLAY' || state.campaignId !== 'campaign2' || !state.campaign2) {
    return state;
  }
  if (state.campaign2.phase !== 'play') return state;
  return beginCampaign2Play(state, state.campaign2.currentIndex);
}
