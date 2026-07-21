// src/state/updateState.ts

import type { GameAction, GameState, Vec2 } from './types';

const SPEED = 200;
const TOUCH_DEADZONE = 2;

function setVelocityFromDelta(dx: number, dy: number): Vec2 {
  const mag = Math.hypot(dx, dy);
  if (mag < TOUCH_DEADZONE) return { x: 0, y: 0 };
  return { x: (dx / mag) * SPEED, y: (dy / mag) * SPEED };
}

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

    case 'TOUCH_MOVE': {
      const velocity = setVelocityFromDelta(action.dx, action.dy);
      return { ...state, player: { ...state.player, velocity } };
    }

    case 'TOUCH_END':
      return {
        ...state,
        player: { ...state.player, velocity: { x: 0, y: 0 } },
      };

    default:
      return state;
  }
}
