// src/input/tap.ts — 轻点（MENU / WIN 等效 Enter）

const TAP_MOVE_THRESHOLD_PX = 14;

export function bindTap(canvas: HTMLCanvasElement, onTap: () => void): void {
  let startX = 0;
  let startY = 0;
  let tracking = false;

  canvas.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length !== 1) {
        tracking = false;
        return;
      }
      tracking = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    },
    { passive: true },
  );

  canvas.addEventListener(
    'touchend',
    (e) => {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (dx * dx + dy * dy <= TAP_MOVE_THRESHOLD_PX * TAP_MOVE_THRESHOLD_PX) {
        onTap();
      }
    },
    { passive: true },
  );

  canvas.addEventListener('click', (e) => {
    if (e.detail === 0) return;
    onTap();
  });
}
