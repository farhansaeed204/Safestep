import type { Detection } from '@/ml/types';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function makeBox(
  source: Detection['source'],
  classId: number,
  score: number,
  cx: number,
  distance: number,
  realHeight: number,
  widthRatio: number,
): Detection {
  const h = clamp(realHeight / (distance * 0.9), 0.05, 0.9);
  const w = clamp(h * widthRatio, 0.05, 0.95);
  const cy = clamp(0.5 + h * 0.15, 0.3, 0.8);
  const x = clamp(cx - w / 2, 0, 1 - w);
  const y = clamp(cy - h / 2, 0, 1 - h);
  const zone = cx < 0.38 ? 'left' : cx > 0.62 ? 'right' : 'center';

  return {
    source,
    classId,
    score,
    x,
    y,
    w,
    h,
    cx,
    cy,
    distance,
    zone,
  };
}

export function demoSample(elapsedSec: number): Detection[] {
  const cycle = elapsedSec % 28;
  const detections: Detection[] = [];

  const carDistance = 2.5 + (1 - Math.min(1, cycle / 20)) * 27.5;
  detections.push(makeBox('coco', 2, 0.92, 0.5, carDistance, 1.5, 0.62));

  if (cycle > 6) {
    detections.push(makeBox('coco', 16, 0.82, 0.3, 6.5, 0.55, 1.1));
  }

  if (cycle > 12) {
    detections.push(makeBox('coco', 0, 0.84, 0.74, 11, 1.7, 0.45));
  }

  if (cycle > 18) {
    detections.push(makeBox('coco', 56, 0.72, 0.52, 9, 1.0, 0.9));
  }

  return detections;
}
