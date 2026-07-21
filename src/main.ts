// src/main.ts — M0-1 脚手架占位；M0-3 起装配 Canvas + Game Loop

const canvas = document.querySelector<HTMLCanvasElement>('#game');
if (!canvas) {
  throw new Error('Canvas #game not found');
}

const ctx = canvas.getContext('2d');
if (!ctx) {
  throw new Error('CanvasRenderingContext2D unavailable');
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.fillStyle = '#1a1a2e';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = '#ffffff';
ctx.font = '16px sans-serif';
ctx.fillText('Kiddo Canvas Quest — M0-1 scaffold ready', 24, 40);

console.info('[kiddo] M0-1 Vite + TS scaffold OK');
