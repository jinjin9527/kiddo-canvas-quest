// src/game/layoutLevel.ts — 选项区随机布局（见 03-04 §选项区布局）

import type { GameState, LevelDefinition, LevelOptionPlaced, Rect } from '../state/types';

export const OPTION_ZONE_SIZE = 80;
const MARGIN = 28;
/** 顶栏仅文案；题图随猫移动，不再占用固定顶区 */
const PLAY_AREA_TOP = 56;
const MAX_ATTEMPTS = 400;

function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function randomRect(width: number, height: number): Rect {
  return {
    x: MARGIN + Math.random() * (width - 2 * MARGIN - OPTION_ZONE_SIZE),
    y: PLAY_AREA_TOP + Math.random() * (height - PLAY_AREA_TOP - MARGIN - OPTION_ZONE_SIZE),
    width: OPTION_ZONE_SIZE,
    height: OPTION_ZONE_SIZE,
  };
}

export function layoutLevelOptions(
  def: LevelDefinition,
  canvasWidth: number,
  canvasHeight: number,
): { options: LevelOptionPlaced[]; spawn: { x: number; y: number } } {
  const zones: Rect[] = [];
  const options: LevelOptionPlaced[] = [];

  for (const opt of def.options) {
    let placed: Rect | null = null;
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const candidate = randomRect(canvasWidth, canvasHeight);
      if (zones.every((z) => !rectsOverlap(z, candidate))) {
        placed = candidate;
        zones.push(candidate);
        break;
      }
    }
    if (!placed) {
      placed = randomRect(canvasWidth, canvasHeight);
      zones.push(placed);
    }
    options.push({ ...opt, zone: placed });
  }

  let spawn = { x: canvasWidth / 2, y: canvasHeight - MARGIN - OPTION_ZONE_SIZE / 2 };
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const candidate = {
      x: MARGIN + Math.random() * (canvasWidth - 2 * MARGIN),
      y: PLAY_AREA_TOP + Math.random() * (canvasHeight - PLAY_AREA_TOP - 2 * MARGIN),
    };
    const spawnRect: Rect = {
      x: candidate.x - OPTION_ZONE_SIZE / 2,
      y: candidate.y - OPTION_ZONE_SIZE / 2,
      width: OPTION_ZONE_SIZE,
      height: OPTION_ZONE_SIZE,
    };
    if (zones.every((z) => !rectsOverlap(z, spawnRect))) {
      spawn = candidate;
      break;
    }
  }

  return { options, spawn };
}

export function playerHitsOption(
  playerX: number,
  playerY: number,
  playerRadius: number,
  zone: Rect,
): boolean {
  const closestX = clamp(playerX, zone.x, zone.x + zone.width);
  const closestY = clamp(playerY, zone.y, zone.y + zone.height);
  const dx = playerX - closestX;
  const dy = playerY - closestY;
  return dx * dx + dy * dy <= playerRadius * playerRadius;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** 每关开局 / 错关重来：从本关四个选项里随机决定猫举着哪一个 */
function pickRandomTarget(def: LevelDefinition): { promptImage: string; correctOptionId: string } {
  const choice = def.options[Math.floor(Math.random() * def.options.length)];
  return { promptImage: choice.image, correctOptionId: choice.id };
}

export function beginLevelPlay(state: GameState, index: number): GameState {
  if (!state.level) return state;
  const def = state.level.definitions[index];
  if (!def) return state;

  const { options, spawn } = layoutLevelOptions(def, state.canvas.width, state.canvas.height);
  const target = pickRandomTarget(def);

  return {
    ...state,
    level: {
      ...state.level,
      currentIndex: index,
      phase: 'play',
      lastResult: 'none',
      feedbackTimer: 0,
      promptImage: target.promptImage,
      correctOptionId: target.correctOptionId,
      options,
    },
    player: {
      ...state.player,
      position: { x: spawn.x, y: spawn.y },
      velocity: { x: 0, y: 0 },
    },
  };
}

function clampPlayerToCanvas(state: GameState): GameState {
  const half = state.player.size / 2;
  const { canvas, player } = state;
  return {
    ...state,
    player: {
      ...player,
      position: {
        x: clamp(player.position.x, half, canvas.width - half),
        y: clamp(player.position.y, half, canvas.height - half),
      },
    },
  };
}

export function relayoutIfPlaying(state: GameState): GameState {
  if (state.scene !== 'PLAY' || !state.level || state.level.phase !== 'play') {
    return state;
  }
  return clampPlayerToCanvas(beginLevelPlay(state, state.level.currentIndex));
}
