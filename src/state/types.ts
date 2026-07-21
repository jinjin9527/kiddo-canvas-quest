// src/state/types.ts

export interface Vec2 {
  x: number;
  y: number;
}

export interface Player {
  position: Vec2;
  velocity: Vec2;
  size: number;
  color: string;
}

export interface CanvasInfo {
  width: number;
  height: number;
}

export interface GameState {
  canvas: CanvasInfo;
  player: Player;
  /** M0 固定 'PLAY'；M2 扩展 FSM */
  scene: 'PLAY';
  /** M3+ */
  isLoading: boolean;
}

export type GameAction =
  | { type: 'RESIZE'; width: number; height: number }
  | { type: 'KEY_DOWN'; key: string }
  | { type: 'KEY_UP'; key: string }
  | { type: 'TICK'; deltaTime: number }
  | { type: 'TOUCH_MOVE'; dx: number; dy: number }
  | { type: 'TOUCH_END' };
