// src/main.ts — M0-6：装配入口（update / render 解耦）

import { createGameLoop } from './game/gameLoop';
import { bindKeyboard } from './input/keyboard';
import { bindResize } from './input/resize';
import { render } from './render/render';
import { createInitialState } from './state/initialState';
import { updateState } from './state/updateState';
import type { GameAction, GameState } from './state/types';

const canvas = document.querySelector<HTMLCanvasElement>('#game');
if (!canvas) {
  throw new Error('Canvas #game not found');
}

const ctx = canvas.getContext('2d');
if (!ctx) {
  throw new Error('CanvasRenderingContext2D unavailable');
}
const context = ctx;

canvas.focus();

let state: GameState = createInitialState();
const pendingActions: GameAction[] = [];

bindResize(window, (width, height) => {
  pendingActions.push({ type: 'RESIZE', width, height });
});

bindKeyboard(window, (action) => {
  pendingActions.push(action);
});

createGameLoop((deltaTime) => {
  for (const action of pendingActions) {
    state = updateState(state, action);
  }
  pendingActions.length = 0;
  state = updateState(state, { type: 'TICK', deltaTime });
  render(context, state);
}).start();

console.info('[kiddo] M0 complete — red square + keyboard + boundary');
