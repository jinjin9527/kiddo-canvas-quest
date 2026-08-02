// src/render/render.ts

import type { GameState } from '../state/types';
import { drawImageFit } from './imageCache';

const CAT_IDLE = '/assets/cat-idle.png';
const CAT_HAPPY = '/assets/cat-happy.svg';
const CAT_SAD = '/assets/cat-sad.svg';

function clearBackground(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { canvas } = state;
  ctx.canvas.width = canvas.width;
  ctx.canvas.height = canvas.height;
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  lines: string[],
  fontSize: number,
): void {
  ctx.fillStyle = '#ffffff';
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lineHeight = fontSize * 1.4;
  const startY = state.canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, state.canvas.width / 2, startY + i * lineHeight);
  });
}

function renderLevelPlay(ctx: CanvasRenderingContext2D, state: GameState): void {
  const level = state.level;
  if (!level) return;

  const titleBarHeight = 52;
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(0, 0, state.canvas.width, titleBarHeight);
  ctx.fillStyle = '#ffffff';
  ctx.font = '18px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('小猫连连看', state.canvas.width / 2, titleBarHeight / 2);

  for (const opt of level.options) {
    const { zone } = opt;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
    ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
    const pad = 8;
    drawImageFit(
      ctx,
      opt.image,
      zone.x + pad,
      zone.y + pad,
      zone.width - pad * 2,
      zone.height - pad * 2,
    );
  }

  const { player } = state;
  const catSize = player.size;
  const heldSize = catSize * 0.72;
  const heldGap = catSize * 0.06;
  const catX = player.position.x - catSize / 2;
  const catY = player.position.y - catSize / 2;

  drawImageFit(ctx, CAT_IDLE, catX, catY, catSize, catSize);

  drawImageFit(
    ctx,
    level.promptImage,
    player.position.x - heldSize / 2,
    catY - heldGap - heldSize,
    heldSize,
    heldSize,
  );

  if (level.phase === 'feedback') {
    const overlay = level.lastResult === 'correct' ? CAT_HAPPY : CAT_SAD;
    const ow = catSize * 0.85;
    const gap = catSize * 0.12;
    const catLeft = player.position.x - catSize / 2;
    const catRight = player.position.x + catSize / 2;
    const oy = player.position.y - ow / 2;

    let ox = catRight + gap;
    if (ox + ow > state.canvas.width) {
      ox = catLeft - gap - ow;
    }
    ox = Math.max(0, Math.min(state.canvas.width - ow, ox));

    drawImageFit(ctx, overlay, ox, oy, ow, ow);
  }
}

function renderPlay(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (state.level && state.level.definitions.length > 0) {
    renderLevelPlay(ctx, state);
    return;
  }
  const { player } = state;
  ctx.fillStyle = player.color;
  ctx.fillRect(
    player.position.x - player.size / 2,
    player.position.y - player.size / 2,
    player.size,
    player.size,
  );
}

export function render(ctx: CanvasRenderingContext2D, state: GameState): void {
  clearBackground(ctx, state);

  switch (state.scene) {
    case 'MENU': {
      if (state.isLoading) {
        drawCenteredText(ctx, state, ['Kiddo Canvas Quest', '加载关卡…'], 28);
      } else if (state.loadError) {
        drawCenteredText(ctx, state, ['加载失败', state.loadError], 22);
      } else {
        drawCenteredText(ctx, state, ['Kiddo Canvas Quest', '点击屏幕开始', '（电脑可 Enter）'], 26);
      }
      break;
    }
    case 'PLAY':
      renderPlay(ctx, state);
      break;
    case 'BOOT':
      drawCenteredText(ctx, state, ['加载中…'], 24);
      break;
    case 'QUIZ':
      drawCenteredText(ctx, state, ['（预留）'], 24);
      break;
    case 'WIN':
      drawCenteredText(ctx, state, ['恭喜通关！', '点击屏幕返回菜单', '（电脑可 Enter）'], 26);
      break;
    default: {
      const _exhaustive: never = state.scene;
      return _exhaustive;
    }
  }
}
