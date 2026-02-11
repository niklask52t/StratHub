const HIT_TOLERANCE = 8;

export function hitTestDraw(draw: any, x: number, y: number): boolean {
  if (draw.isDeleted) return false;
  const data = draw.data || {};

  switch (draw.type) {
    case 'path': {
      const points = data.points || [];
      const tolerance = Math.max(HIT_TOLERANCE, (data.lineWidth || 3) / 2 + 4);
      for (let i = 0; i < points.length - 1; i++) {
        if (distToSegment(x, y, points[i].x, points[i].y, points[i + 1].x, points[i + 1].y) < tolerance) {
          return true;
        }
      }
      return false;
    }
    case 'line': {
      const tolerance = Math.max(HIT_TOLERANCE, (data.lineWidth || 3) / 2 + 4);
      return distToSegment(
        x, y,
        draw.originX, draw.originY,
        draw.destinationX ?? draw.originX, draw.destinationY ?? draw.originY,
      ) < tolerance;
    }
    case 'rectangle': {
      const w = data.width || (draw.destinationX ?? draw.originX) - draw.originX;
      const h = data.height || (draw.destinationY ?? draw.originY) - draw.originY;
      const x1 = Math.min(draw.originX, draw.originX + w);
      const y1 = Math.min(draw.originY, draw.originY + h);
      const x2 = Math.max(draw.originX, draw.originX + w);
      const y2 = Math.max(draw.originY, draw.originY + h);
      if (data.filled) {
        return x >= x1 && x <= x2 && y >= y1 && y <= y2;
      }
      const tolerance = Math.max(HIT_TOLERANCE, (data.lineWidth || 3) / 2 + 4);
      return (
        distToSegment(x, y, x1, y1, x2, y1) < tolerance ||
        distToSegment(x, y, x2, y1, x2, y2) < tolerance ||
        distToSegment(x, y, x2, y2, x1, y2) < tolerance ||
        distToSegment(x, y, x1, y2, x1, y1) < tolerance
      );
    }
    case 'text': {
      const fs = data.fontSize || 16;
      const approxW = (data.text || '').length * fs * 0.6;
      return x >= draw.originX && x <= draw.originX + approxW && y >= draw.originY - fs && y <= draw.originY + fs * 0.3;
    }
    case 'icon': {
      const s = (data.size || 32) / 2;
      return x >= draw.originX - s && x <= draw.originX + s && y >= draw.originY - s && y <= draw.originY + s;
    }
    default:
      return false;
  }
}

function distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}
