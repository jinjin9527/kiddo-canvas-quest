// src/input/keyboard.ts

import type { GameAction } from '../state/types';

const PREVENT_DEFAULT_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];

export function bindKeyboard(
  target: Window,
  onAction: (action: GameAction) => void,
): void {
  target.addEventListener('keydown', (e) => {
    if (PREVENT_DEFAULT_KEYS.includes(e.key)) {
      e.preventDefault();
    }
    onAction({ type: 'KEY_DOWN', key: e.key });
  });

  target.addEventListener('keyup', (e) => {
    onAction({ type: 'KEY_UP', key: e.key });
  });
}
