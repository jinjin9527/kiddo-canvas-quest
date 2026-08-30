// src/input/tap.ts — 轻点（坐标进 canvas 空间）

const TAP_MOVE_THRESHOLD_PX = 14;

export function clientToCanvas(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

export function bindTap(
  canvas: HTMLCanvasElement,
  onTap: (x: number, y: number) => void,
): void {
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
        const p = clientToCanvas(canvas, t.clientX, t.clientY);
        onTap(p.x, p.y);
      }
    },
    { passive: true },
  );

  canvas.addEventListener('click', (e) => {
    if (e.detail === 0) return;
    const p = clientToCanvas(canvas, e.clientX, e.clientY);
    onTap(p.x, p.y);
  });
}
