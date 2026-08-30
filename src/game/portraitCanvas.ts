// src/game/portraitCanvas.ts — 战役2 竖屏 9:16

import type { CanvasInfo, CampaignId, SceneId } from '../state/types';

const PORTRAIT_RATIO = 9 / 16;

export function fitPortrait(viewportWidth: number, viewportHeight: number): CanvasInfo {
  const vw = Math.max(1, viewportWidth);
  const vh = Math.max(1, viewportHeight);
  const viewRatio = vw / vh;

  if (viewRatio > PORTRAIT_RATIO) {
    const height = vh;
    const width = height * PORTRAIT_RATIO;
    return { width: Math.floor(width), height: Math.floor(height) };
  }
  const width = vw;
  const height = width / PORTRAIT_RATIO;
  return { width: Math.floor(width), height: Math.floor(height) };
}

export function canvasForScene(
  viewport: CanvasInfo,
  scene: SceneId,
  campaignId: CampaignId | null,
): CanvasInfo {
  if (scene === 'PLAY' && campaignId === 'campaign2') {
    return fitPortrait(viewport.width, viewport.height);
  }
  return { width: viewport.width, height: viewport.height };
}
