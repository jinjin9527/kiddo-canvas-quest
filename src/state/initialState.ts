// src/state/initialState.ts

import type { GameState } from './types';

export function createInitialState(): GameState {
  return {
    canvas: { width: 800, height: 600 },
    viewport: { width: 800, height: 600 },
    scene: 'MENU',
    isLoading: true,
    matchLoadDone: true,
    campaign2LoadDone: false,
    loadError: null,
    level: null,
    campaign2LoadError: null,
    campaign2: null,
    campaignId: null,
    player: {
      position: { x: 400, y: 300 },
      velocity: { x: 0, y: 0 },
      size: 56,
      color: '#e74c3c',
    },
  };
}
