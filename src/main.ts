// src/main.ts — 装配入口（update / render 解耦）

import { bootstrapCampaigns } from './game/loadCampaigns';
import { createGameLoop } from './game/gameLoop';
import { bindKeyboard } from './input/keyboard';
import { bindResize } from './input/resize';
import { bindTap } from './input/tap';
import { bindTouch } from './input/touch';
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

function pushAction(action: GameAction): void {
  pendingActions.push(action);
}

bindResize(window, (width, height) => {
  pushAction({ type: 'RESIZE', width, height });
});

bindKeyboard(window, (action) => {
  pushAction(action);
});

bindTouch(canvas, (action) => {
  pushAction(action);
});

let lastTapAt = 0;
bindTap(canvas, (x, y) => {
  const now = Date.now();
  if (now - lastTapAt < 350) return;
  lastTapAt = now;

  if (state.scene === 'MENU') {
    pushAction({ type: 'MENU_TAP', x, y });
    return;
  }
  if (state.scene === 'WIN') {
    pushAction({ type: 'KEY_DOWN', key: 'Enter' });
  }
});

createGameLoop((deltaTime) => {
  for (const action of pendingActions) {
    state = updateState(state, action);
  }
  pendingActions.length = 0;
  state = updateState(state, { type: 'TICK', deltaTime });
  render(context, state);
}).start();

bootstrapCampaigns(pushAction);

console.info('[kiddo] こねこゲーム — kana-only demo');
