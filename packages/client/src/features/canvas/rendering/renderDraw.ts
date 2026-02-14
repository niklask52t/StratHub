/**
 * Render a single draw onto a 2D canvas context.
 *
 * Supports: path, line, rectangle, text, icon.
 * Handles rotation via translate→rotate→translate around the draw's center.
 * Icon images are cached module-level to avoid flicker on re-renders.
 */

import { getDrawBounds } from './drawBounds';

// Persistent icon image cache — survives component remounts
const imageCache = new Map<string, HTMLImageElement>();

function loadIcon(url: string): HTMLImageElement {
  const cached = imageCache.get(url);
  if (cached) return cached;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = url;
  imageCache.set(url, img);
  return img;
}

export function renderDraw(
  ctx: CanvasRenderingContext2D,
  draw: any,
  onIconLoad?: { current: () => void },
): void {
  const d = draw.data ?? {};

  ctx.save();

  // Apply rotation around the draw center when rotation is set
  if (d.rotation) {
    const bounds = getDrawBounds(draw);
    if (bounds) {
      const cx = bounds.x + bounds.width / 2;
      const cy = bounds.y + bounds.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate(d.rotation);
      ctx.translate(-cx, -cy);
    }
  }

  switch (draw.type) {
    case 'path':
      drawPath(ctx, d);
      break;
    case 'line':
      drawLine(ctx, draw, d);
      break;
    case 'rectangle':
      drawRectangle(ctx, draw, d);
      break;
    case 'text':
      drawText(ctx, draw, d);
      break;
    case 'icon':
      drawIcon(ctx, draw, d, onIconLoad);
      break;
  }

  ctx.restore();
}

function drawPath(ctx: CanvasRenderingContext2D, d: any): void {
  const pts: Array<{ x: number; y: number }> = d.points;
  if (!pts || pts.length < 2) return;

  ctx.strokeStyle = d.color ?? '#FF0000';
  ctx.lineWidth = d.lineWidth ?? 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(pts[0]!.x, pts[0]!.y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i]!.x, pts[i]!.y);
  }
  ctx.stroke();
}

function drawLine(ctx: CanvasRenderingContext2D, draw: any, d: any): void {
  const x1 = draw.originX;
  const y1 = draw.originY;
  const x2 = draw.destinationX ?? x1;
  const y2 = draw.destinationY ?? y1;

  ctx.strokeStyle = d.color ?? '#FF0000';
  ctx.lineWidth = d.lineWidth ?? 3;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawRectangle(ctx: CanvasRenderingContext2D, draw: any, d: any): void {
  const w = d.width ?? ((draw.destinationX ?? draw.originX) - draw.originX);
  const h = d.height ?? ((draw.destinationY ?? draw.originY) - draw.originY);

  ctx.strokeStyle = d.color ?? '#FF0000';
  ctx.lineWidth = d.lineWidth ?? 3;

  if (d.filled) {
    ctx.fillStyle = d.color ?? '#FF0000';
    ctx.globalAlpha = 0.3;
    ctx.fillRect(draw.originX, draw.originY, w, h);
    ctx.globalAlpha = 1;
  }

  ctx.strokeRect(draw.originX, draw.originY, w, h);
}

function drawText(ctx: CanvasRenderingContext2D, draw: any, d: any): void {
  ctx.fillStyle = d.color ?? '#FF0000';
  ctx.font = `${d.fontSize ?? 16}px sans-serif`;
  ctx.fillText(d.text ?? '', draw.originX, draw.originY);
}

function drawIcon(
  ctx: CanvasRenderingContext2D,
  draw: any,
  d: any,
  onIconLoad?: { current: () => void },
): void {
  const size = d.size ?? 32;
  const halfSize = size / 2;

  if (d.iconUrl) {
    const img = loadIcon(d.iconUrl);

    if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, draw.originX - halfSize, draw.originY - halfSize, size, size);
    } else if (onIconLoad) {
      // Schedule a re-render when the image finishes loading
      img.addEventListener('load', () => onIconLoad.current(), { once: true });
    }
    return;
  }

  // Fallback: colored circle with abbreviation text
  if (d.fallbackText) {
    ctx.beginPath();
    ctx.fillStyle = d.fallbackColor ?? '#888888';
    ctx.arc(draw.originX, draw.originY, halfSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(size * 0.5)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(d.fallbackText, draw.originX, draw.originY);
  }
}
