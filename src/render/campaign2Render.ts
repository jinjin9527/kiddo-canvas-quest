// src/render/campaign2Render.ts — 08 竖版 · Figma 算式 + 答题卡

import { assetPath } from '../assetPath';
import { KIDS_COPY } from '../copy/kidsJa';
import { layoutCampaign2Bands } from '../game/campaign2CardLayout';
import type { Campaign2LevelDef, GameState, Rect } from '../state/types';
import { drawImageFit } from './imageCache';

const CAT_IDLE = assetPath('assets/cat-idle.png');
const CAT_HAPPY = assetPath('assets/cat-happy.svg');
const CAT_SAD = assetPath('assets/cat-sad.svg');

const BOX_BORDER = '#e8c547';
const BOX_FILL = '#ffffff';

function drawRoundedBox(ctx: CanvasRenderingContext2D, r: Rect, radius: number): void {
  const { x, y, width: w, height: h } = r;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fillStyle = BOX_FILL;
  ctx.fill();
  ctx.strokeStyle = BOX_BORDER;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function kanaDisplayWord(def: Extract<Campaign2LevelDef, { kind: 'kana_fill' }>): string {
  const chars = [...def.word];
  if (def.gapIndex >= 0 && def.gapIndex < chars.length) {
    chars[def.gapIndex] = '？';
  }
  return chars.join('');
}

function drawKanaQuestion(
  ctx: CanvasRenderingContext2D,
  band: Rect,
  def: Extract<Campaign2LevelDef, { kind: 'kana_fill' }>,
): void {
  const hint = def.hintEmoji ?? '';
  ctx.fillStyle = '#ffffff';
  ctx.font = `${Math.min(48, band.width * 0.12)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const line1 = hint ? `${hint}` : '';
  const line2 = kanaDisplayWord(def);
  const cy = band.y + band.height * 0.45;
  if (line1) ctx.fillText(line1, band.x + band.width / 2, cy - 36);
  ctx.font = `bold ${Math.min(42, band.width * 0.11)}px sans-serif`;
  ctx.fillText(line2, band.x + band.width / 2, cy + 12);
}

function drawAnswerCard(
  ctx: CanvasRenderingContext2D,
  card: Rect,
  choices: { label: string; zone: Rect }[],
): void {
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(card.x, card.y, card.width, card.height);

  for (const opt of choices) {
    const { zone } = opt;
    drawRoundedBox(ctx, zone, 10);
    ctx.fillStyle = '#333';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(opt.label, zone.x + zone.width / 2, zone.y + zone.height / 2);
  }
}

function drawCatWithFeedback(ctx: CanvasRenderingContext2D, state: GameState): void {
  const c2 = state.campaign2;
  if (!c2) return;
  const { player } = state;
  const catSize = player.size;
  drawImageFit(
    ctx,
    CAT_IDLE,
    player.position.x - catSize / 2,
    player.position.y - catSize / 2,
    catSize,
    catSize,
  );

  if (c2.phase !== 'feedback') return;

  const overlay = c2.lastResult === 'correct' ? CAT_HAPPY : CAT_SAD;
  const ow = catSize * 0.85;
  const gap = catSize * 0.12;
  const catLeft = player.position.x - catSize / 2;
  const catRight = player.position.x + catSize / 2;
  const oy = player.position.y - ow / 2;
  let ox = catRight + gap;
  if (ox + ow > state.canvas.width) ox = catLeft - gap - ow;
  ox = Math.max(0, Math.min(state.canvas.width - ow, ox));
  drawImageFit(ctx, overlay, ox, oy, ow, ow);
}

export function renderCampaign2Play(ctx: CanvasRenderingContext2D, state: GameState): void {
  const c2 = state.campaign2;
  if (!c2) return;
  const def = c2.definitions[c2.currentIndex];
  if (!def) return;

  const titleBarHeight = 44;
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(0, 0, state.canvas.width, titleBarHeight);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(KIDS_COPY.title, state.canvas.width / 2, titleBarHeight / 2);

  const bands = layoutCampaign2Bands(state.canvas);

  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.fillRect(bands.question.x, bands.question.y, bands.question.width, bands.question.height);
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  ctx.fillRect(bands.playFloor.x, bands.playFloor.y, bands.playFloor.width, bands.playFloor.height);

  if (def.kind === 'kana_fill') {
    drawKanaQuestion(ctx, bands.question, def);
  }

  drawAnswerCard(ctx, bands.answerCard, c2.choices);
  drawCatWithFeedback(ctx, state);

  const progress = KIDS_COPY.progress(c2.currentIndex + 1, c2.definitions.length);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(progress, state.canvas.width - 12, titleBarHeight + 8);
}
