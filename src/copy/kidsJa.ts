// src/copy/kidsJa.ts — 3〜5歳向け・画面文言（ひらがな中心）

export const KIDS_COPY = {
  title: 'こねこゲーム',
  subtitle: 'かなクイズ',
  start: 'はじめる',
  tapOrEnter: 'タップ　または　Enterキー',
  loading: 'よみこみ中…',
  reserved: '（よやく）',
  clear: 'クリア！',
  backToTitle: 'タイトルにもどる',
  loadFailed: 'よみこみに　しっぱい　しました',
  progress: (current: number, total: number) => `${current}／${total}もん`,
} as const;
