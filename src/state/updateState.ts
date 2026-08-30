// src/state/updateState.ts

import { beginCampaign2Play, relayoutCampaign2IfPlaying } from '../game/layoutCampaign2';
import { canvasForScene } from '../game/portraitCanvas';
import { beginLevelPlay, playerHitsOption, relayoutIfPlaying } from '../game/layoutLevel';
import { hitMenuButton, layoutMenuButtons } from '../ui/menuLayout';
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

function withLoadSettled(state: GameState, patch: Partial<GameState>): GameState {
  const next = { ...state, ...patch };
  const isLoading = !next.campaign2LoadDone;
  return { ...next, isLoading };
}

function withScene(state: GameState, scene: GameState['scene']): GameState {
  return {
    ...state,
    scene,
    player: { ...state.player, velocity: { x: 0, y: 0 } },
  };
}

function idleCampaign2From(state: GameState): GameState['campaign2'] {
  if (!state.campaign2) return null;
  return {
    ...state.campaign2,
    currentIndex: 0,
    phase: 'play',
    lastResult: 'none',
    feedbackTimer: 0,
    correctChoiceId: '',
    choices: [],
    mathRoll: null,
  };
}

function canMovePlayer(state: GameState): boolean {
  if (state.scene !== 'PLAY') return false;
  if (state.campaignId === 'campaign2') {
    return state.campaign2?.phase === 'play';
  }
  if (!state.level) return false;
  return state.level.phase === 'play';
}

function resolveMatchEnterOption(state: GameState, optionId: string): GameState {
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

function resolveCampaign2EnterOption(state: GameState, optionId: string): GameState {
  if (!state.campaign2 || state.campaign2.phase !== 'play') return state;
  const correct = optionId === state.campaign2.correctChoiceId;
  return {
    ...state,
    player: { ...state.player, velocity: { x: 0, y: 0 } },
    campaign2: {
      ...state.campaign2,
      phase: 'feedback',
      lastResult: correct ? 'correct' : 'wrong',
      feedbackTimer: FEEDBACK_DURATION,
    },
  };
}

function tryPickOption(state: GameState): GameState {
  const { player } = state;
  const radius = player.size / 2;

  if (state.campaignId === 'campaign2' && state.campaign2?.phase === 'play') {
    for (const opt of state.campaign2.choices) {
      if (playerHitsOption(player.position.x, player.position.y, radius, opt.zone)) {
        return resolveCampaign2EnterOption(state, opt.id);
      }
    }
    return state;
  }

  if (!state.level || state.level.phase !== 'play') return state;
  for (const opt of state.level.options) {
    if (playerHitsOption(player.position.x, player.position.y, radius, opt.zone)) {
      return resolveMatchEnterOption(state, opt.id);
    }
  }
  return state;
}

function finishMatchFeedback(state: GameState): GameState {
  if (!state.level) return state;
  if (state.level.lastResult === 'wrong') {
    return beginLevelPlay(state, state.level.currentIndex);
  }
  const nextIndex = state.level.currentIndex + 1;
  if (nextIndex >= state.level.definitions.length) {
    return withScene({ ...state, campaignId: 'match' }, 'WIN');
  }
  return beginLevelPlay(state, nextIndex);
}

function finishCampaign2Feedback(state: GameState): GameState {
  if (!state.campaign2) return state;
  if (state.campaign2.lastResult === 'wrong') {
    return beginCampaign2Play(state, state.campaign2.currentIndex);
  }
  const nextIndex = state.campaign2.currentIndex + 1;
  if (nextIndex >= state.campaign2.definitions.length) {
    return withScene({ ...state, campaignId: 'campaign2' }, 'WIN');
  }
  return beginCampaign2Play(state, nextIndex);
}

function tickPlay(state: GameState, deltaTime: number): GameState {
  if (state.scene !== 'PLAY') return state;

  if (state.campaignId === 'campaign2' && state.campaign2) {
    if (state.campaign2.phase === 'feedback') {
      const feedbackTimer = state.campaign2.feedbackTimer - deltaTime;
      if (feedbackTimer > 0) {
        return { ...state, campaign2: { ...state.campaign2, feedbackTimer } };
      }
      return finishCampaign2Feedback(state);
    }
    return state;
  }

  if (!state.level) return state;
  if (state.level.phase === 'feedback') {
    const feedbackTimer = state.level.feedbackTimer - deltaTime;
    if (feedbackTimer > 0) {
      return { ...state, level: { ...state.level, feedbackTimer } };
    }
    return finishMatchFeedback(state);
  }
  return state;
}

function selectCampaign(state: GameState, campaignId: GameState['campaignId']): GameState {
  if (state.scene !== 'MENU' || state.isLoading || !campaignId) return state;

  if (campaignId === 'match') {
    if (state.loadError || !state.level) return state;
    const canvas = canvasForScene(state.viewport, 'PLAY', 'match');
    return beginLevelPlay({ ...withScene(state, 'PLAY'), campaignId: 'match', canvas }, 0);
  }

  if (campaignId === 'campaign2') {
    if (state.campaign2LoadError || !state.campaign2) return state;
    const canvas = canvasForScene(state.viewport, 'PLAY', 'campaign2');
    return beginCampaign2Play({ ...withScene(state, 'PLAY'), canvas }, 0);
  }

  return state;
}

export function updateState(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'RESIZE': {
      const viewport = { width: action.width, height: action.height };
      const canvas = canvasForScene(viewport, state.scene, state.campaignId);
      let next = { ...state, viewport, canvas };
      next = relayoutIfPlaying(next);
      next = relayoutCampaign2IfPlaying(next);
      return next;
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
      return withLoadSettled(state, {
        loadError: null,
        level,
        matchLoadDone: true,
      });
    }

    case 'LEVELS_LOAD_FAILED':
      return withLoadSettled(state, {
        loadError: action.message,
        level: null,
        matchLoadDone: true,
      });

    case 'CAMPAIGN2_LOADED':
      return withLoadSettled(state, {
        campaign2LoadError: null,
        campaign2: {
          definitions: action.levels,
          currentIndex: 0,
          phase: 'play',
          lastResult: 'none',
          feedbackTimer: 0,
          correctChoiceId: '',
          choices: [],
          mathRoll: null,
        },
        campaign2LoadDone: true,
      });

    case 'CAMPAIGN2_LOAD_FAILED':
      return withLoadSettled(state, {
        campaign2LoadError: action.message,
        campaign2: null,
        campaign2LoadDone: true,
      });

    case 'SELECT_CAMPAIGN':
      return selectCampaign(state, action.campaignId);

    case 'MENU_TAP': {
      if (state.scene !== 'MENU' || state.isLoading) return state;
      const buttons = layoutMenuButtons(state.canvas);
      if (hitMenuButton(buttons, action.x, action.y) === 'start') {
        return selectCampaign(state, 'campaign2');
      }
      return state;
    }

    case 'ENTER_OPTION':
      if (state.campaignId === 'campaign2') {
        return resolveCampaign2EnterOption(state, action.optionId);
      }
      return resolveMatchEnterOption(state, action.optionId);

    case 'GOTO_SCENE':
      return withScene(state, action.scene);

    case 'KEY_DOWN': {
      if (state.scene === 'WIN' && action.key === 'Enter') {
        const canvas = canvasForScene(state.viewport, 'MENU', null);
        let reset = withScene({ ...state, campaignId: null, canvas }, 'MENU');
        if (reset.level) {
          reset = {
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
        return { ...reset, campaign2: idleCampaign2From(reset) };
      }

      if (state.scene === 'MENU') {
        if (action.key === 'Enter' && !state.isLoading) {
          return selectCampaign(state, 'campaign2');
        }
        return state;
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

      return tickPlay(next, action.deltaTime);
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
