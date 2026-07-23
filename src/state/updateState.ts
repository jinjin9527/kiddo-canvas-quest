// src/state/updateState.ts

import { beginLevelPlay, playerHitsOption, relayoutIfPlaying } from '../game/layoutLevel';
import type { GameAction, GameState } from './types';

const SPEED = 340;
const TOUCH_DEADZONE = 2;
const FEEDBACK_DURATION = 2;

function setVelocityFromDelta(dx: number, dy: number) {
  const mag = Math.hypot(dx, dy);
  if (mag < TOUCH_DEADZONE) return { x: 0, y: 0 };
  return { x: (dx / mag) * SPEED, y: (dy / mag) * SPEED };
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function withScene(state: GameState, scene: GameState['scene']): GameState {
  return {
    ...state,
    scene,
    player: { ...state.player, velocity: { x: 0, y: 0 } },
  };
}

function canMovePlayer(state: GameState): boolean {
  if (state.scene !== 'PLAY') return false;
  if (!state.level) return true;
  return state.level.phase === 'play';
}

function tryPickOption(state: GameState): GameState {
  if (!state.level || state.level.phase !== 'play') return state;

  const { player, level } = state;
  const radius = player.size / 2;
  for (const opt of level.options) {
    if (playerHitsOption(player.position.x, player.position.y, radius, opt.zone)) {
      return resolveEnterOption(state, opt.id);
    }
  }
  return state;
}

function resolveEnterOption(state: GameState, optionId: string): GameState {
  if (!state.level || state.level.phase !== 'play') return state;

  const correct = optionId === state.level.correctOptionId;
  return {
    ...state,
    player: { ...state.player, velocity: { x: 0, y: 0 } },
    level: {
      ...state.level,
      phase: 'feedback',
      lastResult: correct ? 'correct' : 'wrong',
      feedbackTimer: FEEDBACK_DURATION,
    },
  };
}

function finishFeedback(state: GameState): GameState {
  if (!state.level) return state;

  if (state.level.lastResult === 'wrong') {
    return beginLevelPlay(state, state.level.currentIndex);
  }

  const nextIndex = state.level.currentIndex + 1;
  if (nextIndex >= state.level.definitions.length) {
    return withScene(state, 'WIN');
  }
  return beginLevelPlay(state, nextIndex);
}

function tickLevel(state: GameState, deltaTime: number): GameState {
  if (state.scene !== 'PLAY' || !state.level) return state;

  if (state.level.phase === 'feedback') {
    const feedbackTimer = state.level.feedbackTimer - deltaTime;
    if (feedbackTimer > 0) {
      return { ...state, level: { ...state.level, feedbackTimer } };
    }
    return finishFeedback(state);
  }

  return state;
}

export function updateState(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'RESIZE': {
      const next = { ...state, canvas: { width: action.width, height: action.height } };
      return relayoutIfPlaying(next);
    }

    case 'LEVELS_LOADED': {
      const level = {
        definitions: action.levels,
        currentIndex: 0,
        phase: 'play' as const,
        lastResult: 'none' as const,
        feedbackTimer: 0,
        promptImage: '',
        correctOptionId: '',
        options: [],
      };
      return {
        ...state,
        isLoading: false,
        loadError: null,
        level,
      };
    }

    case 'LEVELS_LOAD_FAILED':
      return {
        ...state,
        isLoading: false,
        loadError: action.message,
        level: null,
      };

    case 'ENTER_OPTION':
      return resolveEnterOption(state, action.optionId);

    case 'GOTO_SCENE':
      return withScene(state, action.scene);

    case 'KEY_DOWN': {
      if (state.scene === 'WIN' && action.key === 'Enter') {
        const reset = withScene(state, 'MENU');
        if (!reset.level) return reset;
        return {
          ...reset,
          level: {
            ...reset.level,
            currentIndex: 0,
            phase: 'play',
            lastResult: 'none',
            feedbackTimer: 0,
            options: [],
            promptImage: '',
            correctOptionId: '',
          },
        };
      }

      if (state.scene === 'MENU' && action.key === 'Enter') {
        if (state.isLoading || state.loadError || !state.level) return state;
        return beginLevelPlay(withScene(state, 'PLAY'), 0);
      }

      if (!canMovePlayer(state)) return state;

      const v = { ...state.player.velocity };
      if (action.key === 'ArrowLeft' || action.key === 'a') v.x = -SPEED;
      if (action.key === 'ArrowRight' || action.key === 'd') v.x = SPEED;
      if (action.key === 'ArrowUp' || action.key === 'w') v.y = -SPEED;
      if (action.key === 'ArrowDown' || action.key === 's') v.y = SPEED;
      return { ...state, player: { ...state.player, velocity: v } };
    }

    case 'KEY_UP': {
      if (!canMovePlayer(state)) return state;

      const v = { ...state.player.velocity };
      if (['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(action.key)) v.x = 0;
      if (['ArrowUp', 'ArrowDown', 'w', 's'].includes(action.key)) v.y = 0;
      return { ...state, player: { ...state.player, velocity: v } };
    }

    case 'TICK': {
      let next = state;

      if (canMovePlayer(next)) {
        const { player, canvas } = next;
        const half = player.size / 2;
        let x = player.position.x + player.velocity.x * action.deltaTime;
        let y = player.position.y + player.velocity.y * action.deltaTime;
        x = clamp(x, half, canvas.width - half);
        y = clamp(y, half, canvas.height - half);
        next = {
          ...next,
          player: { ...next.player, position: { x, y } },
        };
        next = tryPickOption(next);
      }

      return tickLevel(next, action.deltaTime);
    }

    case 'TOUCH_MOVE': {
      if (!canMovePlayer(state)) return state;
      const velocity = setVelocityFromDelta(action.dx, action.dy);
      return { ...state, player: { ...state.player, velocity } };
    }

    case 'TOUCH_END': {
      if (!canMovePlayer(state)) return state;
      return {
        ...state,
        player: { ...state.player, velocity: { x: 0, y: 0 } },
      };
    }

    default:
      return state;
  }
}
