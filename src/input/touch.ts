// src/input/touch.ts

import type { GameAction } from '../state/types';

export function bindTouch(
  canvas: HTMLCanvasElement,
  onAction: (action: GameAction) => void,
): void {
  let lastX = 0;
  let lastY = 0;
  let tracking = false;

  canvas.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length === 0) return;
      const t = e.touches[0];
      lastX = t.clientX;
      lastY = t.clientY;
      tracking = true;
    },
    { passive: true },
  );

  canvas.addEventListener(
    'touchmove',
    (e) => {
      if (!tracking || e.touches.length === 0) return;
      e.preventDefault();
      const t = e.touches[0];
      const dx = t.clientX - lastX;
      const dy = t.clientY - lastY;
      lastX = t.clientX;
      lastY = t.clientY;
      onAction({ type: 'TOUCH_MOVE', dx, dy });
    },
    { passive: false },
  );

  const endTouch = () => {
    if (!tracking) return;
    tracking = false;
    onAction({ type: 'TOUCH_END' });
  };

  canvas.addEventListener('touchend', endTouch, { passive: true });
  canvas.addEventListener('touchcancel', endTouch, { passive: true });
}
