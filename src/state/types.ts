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

export type CampaignId = 'match' | 'campaign2';

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
  /** 浏览器窗口尺寸（RESIZE 原始值） */
  viewport: CanvasInfo;
  player: Player;
  scene: SceneId;
  /** 两战役 fetch 均未 settle 前为 true */
  isLoading: boolean;
  matchLoadDone: boolean;
  campaign2LoadDone: boolean;
  /** 战役1（找图） */
  loadError: string | null;
  level: LevelRuntime | null;
  /** 战役2 */
  campaign2LoadError: string | null;
  campaign2: Campaign2Runtime | null;
  campaignId: CampaignId | null;
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
  | { type: 'CAMPAIGN2_LOADED'; levels: Campaign2LevelDef[] }
  | { type: 'CAMPAIGN2_LOAD_FAILED'; message: string }
  | { type: 'SELECT_CAMPAIGN'; campaignId: CampaignId }
  | { type: 'MENU_TAP'; x: number; y: number }
  | { type: 'ENTER_OPTION'; optionId: string };

export interface LevelsFile {
  levels: LevelDefinition[];
}

// —— 战役2（M5-1 .catalog；PLAY 实装见 M5-3+）——

export interface MathChoiceDef {
  id: string;
  label: string;
  value: number;
}

export interface MathVisualGroup {
  emoji: string;
  count: number;
}

export interface MathStoryRoll {
  operator: '+' | '-';
  left: MathVisualGroup;
  right: MathVisualGroup;
  correctValue: number;
}

export interface MathStoryLevelDef {
  id: string;
  kind: 'math_story';
  operator: '+' | '-';
  /** JSON 模板；运行时数量由 rollMathStory 生成 */
  left: MathVisualGroup;
  right: MathVisualGroup;
  correctValue: number;
  choices: MathChoiceDef[];
  /** 可选无障碍 / 调试 */
  promptText?: string;
}

export interface KanaChoiceDef {
  id: string;
  glyph: string;
}

export interface KanaFillLevelDef {
  id: string;
  kind: 'kana_fill';
  script: 'hiragana' | 'katakana';
  word: string;
  gapIndex: number;
  hintEmoji?: string;
  options: KanaChoiceDef[];
}

export type Campaign2LevelDef = MathStoryLevelDef | KanaFillLevelDef;

/** 战役2：目录 + PLAY 运行时（MENU 上仅 definitions 有效） */
export interface Campaign2ChoicePlaced {
  id: string;
  label: string;
  zone: Rect;
}

export interface Campaign2Runtime {
  definitions: Campaign2LevelDef[];
  currentIndex: number;
  phase: 'play' | 'feedback';
  lastResult: 'none' | 'correct' | 'wrong';
  feedbackTimer: number;
  correctChoiceId: string;
  choices: Campaign2ChoicePlaced[];
  /** 当前关为 math_story 时，本局随机算式 */
  mathRoll: MathStoryRoll | null;
}

export interface Campaign2File {
  version: number;
  levels: Campaign2LevelDef[];
}
