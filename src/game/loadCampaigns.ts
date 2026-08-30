// src/game/loadCampaigns.ts — 子猫ゲーム · 仅加载假名关卡

import { KIDS_COPY } from '../copy/kidsJa';
import { loadImages } from '../render/imageCache';
import type { Campaign2File, Campaign2LevelDef, GameAction, KanaFillLevelDef } from '../state/types';

const BASE_IMAGES = [
  '/assets/cat-idle.png',
  '/assets/cat-happy.svg',
  '/assets/cat-sad.svg',
];

function kanaLevelsOnly(levels: Campaign2LevelDef[]): KanaFillLevelDef[] {
  return levels.filter((l): l is KanaFillLevelDef => l.kind === 'kana_fill');
}

export async function loadCampaign2Catalog(push: (a: GameAction) => void): Promise<void> {
  try {
    const res = await fetch('/campaign2/levels.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as Campaign2File;
    const levels = kanaLevelsOnly(data.levels);
    if (levels.length === 0) throw new Error('no kana levels');
    await loadImages(BASE_IMAGES);
    push({ type: 'CAMPAIGN2_LOADED', levels });
  } catch {
    push({ type: 'CAMPAIGN2_LOAD_FAILED', message: KIDS_COPY.loadFailed });
  }
}

export function bootstrapCampaigns(push: (a: GameAction) => void): void {
  void loadCampaign2Catalog(push);
}
