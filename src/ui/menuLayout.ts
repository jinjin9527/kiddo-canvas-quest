// src/ui/menuLayout.ts — MENU 单按钮（子猫ゲーム）

import type { CanvasInfo, Rect } from '../state/types';

export interface MenuButtons {
  start: Rect;
}

export interface MenuScreenLayout {
  titleY: number;
  subtitleY: number;
  hintY: number;
  start: Rect;
}

const BTN_H = 40;
const BTN_W_MAX = 132;

export function layoutMenuScreen(canvas: CanvasInfo): MenuScreenLayout {
  const titleY = canvas.height * 0.34;
  const subtitleY = titleY + 42;
  const btnW = Math.min(BTN_W_MAX, Math.floor(canvas.width * 0.34));
  const btnX = (canvas.width - btnW) / 2;
  const btnY = subtitleY + 32;
  return {
    titleY,
    subtitleY,
    hintY: btnY + BTN_H + 22,
    start: { x: btnX, y: btnY, width: btnW, height: BTN_H },
  };
}

/** @deprecated use layoutMenuScreen */
export function layoutMenuButtons(canvas: CanvasInfo): MenuButtons {
  return { start: layoutMenuScreen(canvas).start };
}

export function hitMenuButton(buttons: MenuButtons, x: number, y: number): 'start' | null {
  if (pointInRect(x, y, buttons.start)) return 'start';
  return null;
}

function pointInRect(x: number, y: number, r: Rect): boolean {
  return x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height;
}

export function drawMenuButton(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  label: string,
  enabled: boolean,
): void {
  ctx.fillStyle = enabled ? 'rgba(231, 76, 60, 0.85)' : 'rgba(80, 80, 100, 0.6)';
  ctx.strokeStyle = enabled ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 2;
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, rect.x + rect.width / 2, rect.y + rect.height / 2);
}
