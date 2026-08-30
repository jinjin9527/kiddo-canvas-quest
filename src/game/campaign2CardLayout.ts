// src/game/campaign2CardLayout.ts — 08 固定答题卡 + 猫在下方

import type { Campaign2ChoicePlaced, CanvasInfo, Rect } from '../state/types';

export interface Campaign2LayoutBands {
  question: Rect;
  answerCard: Rect;
  playFloor: Rect;
}

const MARGIN = 16;
const GAP = 10;

export function layoutCampaign2Bands(canvas: CanvasInfo): Campaign2LayoutBands {
  const { width: w, height: h } = canvas;
  const questionBottom = Math.floor(h * 0.42);
  const cardTop = questionBottom + GAP;
  const cardHeight = Math.floor(h * 0.2);
  const cardBottom = cardTop + cardHeight;

  return {
    question: { x: MARGIN, y: MARGIN, width: w - MARGIN * 2, height: questionBottom - MARGIN },
    answerCard: { x: MARGIN, y: cardTop, width: w - MARGIN * 2, height: cardHeight },
    playFloor: { x: 0, y: cardBottom, width: w, height: h - cardBottom },
  };
}

export function layoutAnswerChoices(
  card: Rect,
  labels: { id: string; label: string }[],
): Campaign2ChoicePlaced[] {
  const n = labels.length;
  const innerGap = 8;
  const cellW = (card.width - innerGap * (n + 1)) / n;
  return labels.map((item, i) => ({
    id: item.id,
    label: item.label,
    zone: {
      x: card.x + innerGap + i * (cellW + innerGap),
      y: card.y + innerGap,
      width: cellW,
      height: card.height - innerGap * 2,
    },
  }));
}

export function spawnBelowCard(canvas: CanvasInfo, card: Rect, playerSize: number): { x: number; y: number } {
  const floorTop = card.y + card.height;
  const floorH = canvas.height - floorTop;
  const y = floorTop + floorH * 0.72;
  return { x: canvas.width / 2, y: Math.min(y, canvas.height - playerSize / 2 - 8) };
}
