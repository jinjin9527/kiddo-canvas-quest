// src/render/imageCache.ts

const cache = new Map<string, HTMLImageElement>();

export function getCachedImage(src: string): HTMLImageElement | undefined {
  return cache.get(src);
}

export function loadImages(urls: string[]): Promise<void> {
  const unique = [...new Set(urls)];
  return Promise.all(
    unique.map(
      (src) =>
        new Promise<void>((resolve, reject) => {
          if (cache.has(src)) {
            resolve();
            return;
          }
          const img = new Image();
          img.onload = () => {
            cache.set(src, img);
            resolve();
          };
          img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
          img.src = src;
        }),
    ),
  ).then(() => undefined);
}

export function drawImageFit(
  ctx: CanvasRenderingContext2D,
  src: string,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  const img = cache.get(src);
  if (!img) {
    ctx.fillStyle = '#444';
    ctx.fillRect(x, y, w, h);
    return;
  }
  ctx.drawImage(img, x, y, w, h);
}
