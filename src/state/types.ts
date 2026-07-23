// src/state/types.ts

export interface Vec2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
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

export type SceneId = 'BOOT' | 'MENU' | 'PLAY' | 'QUIZ' | 'WIN';

export type LevelTheme = 'fruit' | 'ball' | 'vehicle' | 'snack';

export interface LevelOptionDef {
  id: string;
  label: string;
  image: string;
}

export interface LevelOptionPlaced extends LevelOptionDef {
  zone: Rect;
}

export interface LevelDefinition {
  id: string;
  theme: LevelTheme;
  promptImage: string;
  correctOptionId: string;
  options: LevelOptionDef[];
}

export interface LevelRuntime {
  definitions: LevelDefinition[];
  currentIndex: number;
  phase: 'play' | 'feedback';
  lastResult: 'none' | 'correct' | 'wrong';
  feedbackTimer: number;
  promptImage: string;
  correctOptionId: string;
  options: LevelOptionPlaced[];
}

export interface GameState {
  canvas: CanvasInfo;
  player: Player;
  scene: SceneId;
  isLoading: boolean;
  loadError: string | null;
  level: LevelRuntime | null;
}

export type GameAction =
  | { type: 'RESIZE'; width: number; height: number }
  | { type: 'KEY_DOWN'; key: string }
  | { type: 'KEY_UP'; key: string }
  | { type: 'TICK'; deltaTime: number }
  | { type: 'TOUCH_MOVE'; dx: number; dy: number }
  | { type: 'TOUCH_END' }
  | { type: 'GOTO_SCENE'; scene: SceneId }
  | { type: 'LEVELS_LOADED'; levels: LevelDefinition[] }
  | { type: 'LEVELS_LOAD_FAILED'; message: string }
  | { type: 'ENTER_OPTION'; optionId: string };

export interface LevelsFile {
  levels: LevelDefinition[];
}
