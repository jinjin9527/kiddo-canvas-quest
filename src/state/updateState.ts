// src/state/updateState.ts

import type { GameAction, GameState } from './types';

const SPEED = 200;

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function updateState(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'RESIZE':
      return { ...state, canvas: { width: action.width, height: action.height } };

    case 'KEY_DOWN': {
      const v = { ...state.player.velocity };
      if (action.key === 'ArrowLeft' || action.key === 'a') v.x = -SPEED;
      if (action.key === 'ArrowRight' || action.key === 'd') v.x = SPEED;
      if (action.key === 'ArrowUp' || action.key === 'w') v.y = -SPEED;
      if (action.key === 'ArrowDown' || action.key === 's') v.y = SPEED;
      return { ...state, player: { ...state.player, velocity: v } };
    }

    case 'KEY_UP': {
      const v = { ...state.player.velocity };
      if (['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(action.key)) v.x = 0;
      if (['ArrowUp', 'ArrowDown', 'w', 's'].includes(action.key)) v.y = 0;
      return { ...state, player: { ...state.player, velocity: v } };
    }

    case 'TICK': {
      const { player, canvas } = state;
      const half = player.size / 2;
      let x = player.position.x + player.velocity.x * action.deltaTime;
      let y = player.position.y + player.velocity.y * action.deltaTime;
      x = clamp(x, half, canvas.width - half);
      y = clamp(y, half, canvas.height - half);
      return {
        ...state,
        player: { ...player, position: { x, y } },
      };
    }

    default:
      return state;
  }
}
