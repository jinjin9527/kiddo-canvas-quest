// src/input/resize.ts

export function bindResize(
  target: Window,
  onResize: (width: number, height: number) => void,
): void {
  const notify = () => onResize(target.innerWidth, target.innerHeight);
  target.addEventListener('resize', notify);
  notify();
}
