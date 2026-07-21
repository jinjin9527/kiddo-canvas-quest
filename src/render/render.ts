// src/render/render.ts

import type { GameState } from '../state/types';

export function render(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { canvas, player } = state;
  ctx.canvas.width = canvas.width;
  ctx.canvas.height = canvas.height;

  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = player.color;
  ctx.fillRect(
    player.position.x - player.size / 2,
    player.position.y - player.size / 2,
    player.size,
    player.size,
  );
}
