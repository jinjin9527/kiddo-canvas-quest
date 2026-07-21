// src/game/gameLoop.ts

export function createGameLoop(onTick: (deltaTime: number) => void) {
  let raf = 0;
  let last = performance.now();
  const MAX_DT = 0.1;

  const loop = (now: number) => {
    let dt = (now - last) / 1000;
    last = now;
    if (dt > MAX_DT) dt = MAX_DT;
    onTick(dt);
    raf = requestAnimationFrame(loop);
  };

  return {
    start: () => {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    },
    stop: () => cancelAnimationFrame(raf),
  };
}
