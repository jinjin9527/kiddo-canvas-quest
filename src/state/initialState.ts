// src/state/initialState.ts

import type { GameState } from './types';

export function createInitialState(): GameState {
  return {
    canvas: { width: 800, height: 600 },
    scene: 'PLAY',
    isLoading: false,
    player: {
      position: { x: 100, y: 100 },
      velocity: { x: 0, y: 0 },
      size: 40,
      color: '#e74c3c',
    },
  };
}
