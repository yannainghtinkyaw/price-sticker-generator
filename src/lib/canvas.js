import { THEMES } from './constants.js';

/**
 * Draw a rounded rectangle path onto ctx.
 */
export function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/**
 * Draw a single price-tag sticker onto ctx at (x,y) with size (w×h).
 */
export function drawSticker(ctx, p, x, y, w, h, font) {
  const color  = THEMES[p.theme].color;
  const filled = !!p.filled;
  const f      = `'${font}'`;
  const bg     = filled ? color : '#fff';
  const fg     = filled ? '#fff' : color;

  // Background
  ctx.fillStyle = bg;
  rrect(ctx, x, y, w, h, 22);
  ctx.fill();

  // Border
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  rrect(ctx, x, y, w, h, 22);
  ctx.stroke();

  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Product name — auto-shrink
  let fs = 32;
  ctx.font = `900 ${fs}px ${f}`;
  while (ctx.measureText(p.name).width > w - 30 && fs > 16) {
    fs--;
    ctx.font = `900 ${fs}px ${f}`;
  }
  ctx.fillText(p.name, x + w / 2, y + h * 0.19);

  // Specs – bold for Classic cards; per-field custom colours
  const specWeight = p.classic ? '800' : '400';
  ctx.font = `${specWeight} 21px ${f}`;
  ctx.fillStyle = p.romColor || fg;
  ctx.fillText(`Storage / ROM ${p.rom} GB`,   x + w / 2, y + h * 0.37);
  ctx.fillStyle = p.batteryColor || fg;
  ctx.fillText(`${p.battery} mAh`,             x + w / 2, y + h * 0.51);
  ctx.fillStyle = fg;

  // Price badge
  const bw = w * 0.72, bh = h * 0.24;
  const bx = x + (w - bw) / 2, by = y + h * 0.67;

  if (filled) {
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    rrect(ctx, bx, by, bw, bh, 13);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.88)';
  } else {
    ctx.strokeStyle = color;
  }
  ctx.lineWidth = 4;
  rrect(ctx, bx, by, bw, bh, 13);
  ctx.stroke();

  ctx.font = `900 44px ${f}`;
  ctx.fillStyle = fg;
  ctx.fillText(`${p.price}.-`, x + w / 2, by + bh / 2);
}
