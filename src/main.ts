// src/main.ts — 装配入口（update / render 解耦）

import { createGameLoop } from './game/gameLoop';
import { bindKeyboard } from './input/keyboard';
import { bindResize } from './input/resize';
import { bindTap } from './input/tap';
import { bindTouch } from './input/touch';
import { loadImages } from './render/imageCache';
import { render } from './render/render';
import { createInitialState } from './state/initialState';
import { updateState } from './state/updateState';
import type { GameAction, GameState, LevelsFile } from './state/types';

const IMAGE_URLS = [
  '/assets/cat-idle.png',
  '/assets/cat-happy.svg',
  '/assets/cat-sad.svg',
];

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
bindTap(canvas, () => {
  const now = Date.now();
  if (now - lastTapAt < 350) return;
  lastTapAt = now;
  pushAction({ type: 'KEY_DOWN', key: 'Enter' });
});

createGameLoop((deltaTime) => {
  for (const action of pendingActions) {
    state = updateState(state, action);
  }
  pendingActions.length = 0;
  state = updateState(state, { type: 'TICK', deltaTime });
  render(context, state);
}).start();

async function bootstrap(): Promise<void> {
  try {
    const res = await fetch('/levels.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as LevelsFile;
    const urls = [...IMAGE_URLS];
    for (const level of data.levels) {
      urls.push(level.promptImage);
      for (const opt of level.options) urls.push(opt.image);
    }
    await loadImages(urls);
    pushAction({ type: 'LEVELS_LOADED', levels: data.levels });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown error';
    pushAction({ type: 'LEVELS_LOAD_FAILED', message });
  }
}

void bootstrap();

console.info('[kiddo] M3 — match levels, random options, cat sprite');
