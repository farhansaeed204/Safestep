import type { Detection, DetectionSource } from './types';

export type RawDetection = {
  classId: number;
  score: number;
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
};

/**
 * Decode a YOLOv8/YOLO11 TFLite detection tensor.
 *
 * Expected output shape: `[1, 4 + numClasses, numAnchors]` (float32),
 * with class scores already sigmoid-activated. Ultralytics exports use either
 * normalized `xywh` (0..1) or input-pixel `xywh` (0..inputSize); the layout is
 * detected from the box rows.
 *
 * Must run inside the camera worklet.
 */
export function decodeYolo(
  output: ArrayBuffer,
  numClasses: number,
  numAnchors: number,
  inputSize: number,
  confidenceThreshold: number,
  iouThreshold: number,
  maxDetections: number,
  classMargin: number,
  classMarginMinScore: number,
  crossClassIouThreshold: number,
): RawDetection[] {
  'worklet';
  const data = new Float32Array(output);
  const stride = numAnchors;
  const candidates: RawDetection[] = [];

  // Detect whether boxes are normalized or in input-pixel space. A full-frame
  // anchor reaches ~1 for normalized exports and ~inputSize for pixel exports.
  let maxBoxValue = 0;
  for (let i = 0; i < numAnchors; i++) {
    const value = Math.max(
      Math.abs(data[i]),
      Math.abs(data[stride + i]),
      Math.abs(data[stride * 2 + i]),
      Math.abs(data[stride * 3 + i]),
    );
    if (value > maxBoxValue) maxBoxValue = value;
  }
  const boxScale = maxBoxValue <= 1.5 ? 1 : inputSize;

  for (let i = 0; i < numAnchors; i++) {
    let bestScore = 0;
    let bestClass = -1;
    let secondScore = 0;
    for (let c = 0; c < numClasses; c++) {
      const score = data[(4 + c) * stride + i];
      if (score > bestScore) {
        secondScore = bestScore;
        bestScore = score;
        bestClass = c;
      } else if (score > secondScore) {
        secondScore = score;
      }
    }
    if (bestClass < 0 || bestScore < confidenceThreshold) continue;
    // Ambiguous anchors cause labels to flicker between similar classes.
    // Keep clear winners only, but allow lower-confidence boxes through so
    // the temporal tracker can still confirm them.
    if (bestScore < classMarginMinScore && bestScore - secondScore < classMargin) {
      continue;
    }

    const rawCx = data[0 * stride + i];
    const rawCy = data[1 * stride + i];
    const rawW = data[2 * stride + i];
    const rawH = data[3 * stride + i];
    if (!isFinite(rawCx) || !isFinite(rawCy) || !isFinite(rawW) || !isFinite(rawH)) {
      continue;
    }
    if (rawW <= 0 || rawH <= 0) continue;

    const w = Math.min(1, rawW / boxScale);
    const h = Math.min(1, rawH / boxScale);
    const cx = Math.min(1, Math.max(0, rawCx / boxScale));
    const cy = Math.min(1, Math.max(0, rawCy / boxScale));
    if (w <= 0 || h <= 0) continue;

    candidates.push({
      classId: bestClass,
      score: bestScore,
      x: cx - w / 2,
      y: cy - h / 2,
      w,
      h,
      cx,
      cy,
    });
  }

  // Sort by confidence (descending).
  candidates.sort((a, b) => b.score - a.score);

  // Greedy non-max suppression. Same-class overlap uses the normal IoU
  // threshold; different labels need a very high overlap before one is
  // dropped, which removes duplicates without hiding nearby real objects.
  const suppressed = new Uint8Array(candidates.length);
  const selected: RawDetection[] = [];
  for (let i = 0; i < candidates.length; i++) {
    if (suppressed[i] === 1) continue;
    const a = candidates[i];
    selected.push(a);
    if (selected.length >= maxDetections) break;

    for (let j = i + 1; j < candidates.length; j++) {
      if (suppressed[j] === 1) continue;
      const b = candidates[j];

      const ix1 = Math.max(a.x, b.x);
      const iy1 = Math.max(a.y, b.y);
      const ix2 = Math.min(a.x + a.w, b.x + b.w);
      const iy2 = Math.min(a.y + a.h, b.y + b.h);
      const inter = Math.max(0, ix2 - ix1) * Math.max(0, iy2 - iy1);
      const union = a.w * a.h + b.w * b.h - inter;
      const iou = union <= 0 ? 0 : inter / union;
      const limit = a.classId === b.classId ? iouThreshold : crossClassIouThreshold;
      if (iou > limit) suppressed[j] = 1;
    }
  }

  return selected;
}

/**
 * Convert raw boxes into app detections with distance + zone. Must run in worklet.
 *
 * The resizer uses `scaleMode: 'cover'` on the upright (rotated-to-screen)
 * frame, producing a centered square crop before scaling to the model input.
 * Pass the upright dimensions here, not the raw buffer dimensions, so boxes
 * and distances line up with the portrait preview.
 */
export function buildDetections(
  raw: RawDetection[],
  source: DetectionSource,
  heights: number[],
  flat: number[],
  uprightWidthPx: number,
  uprightHeightPx: number,
  cameraHeightM: number,
  horizonNorm: number,
  verticalFovDeg: number,
): Detection[] {
  'worklet';
  const tanHalfV = Math.tan((verticalFovDeg * Math.PI) / 360);
  const cropSizePx = Math.min(uprightWidthPx, uprightHeightPx);
  const cropLeftPx = (uprightWidthPx - cropSizePx) / 2;
  const cropTopPx = (uprightHeightPx - cropSizePx) / 2;
  const focalPx = uprightHeightPx / (2 * tanHalfV);
  const horizonPx = horizonNorm * uprightHeightPx;

  const out: Detection[] = [];
  if (uprightWidthPx <= 0 || uprightHeightPx <= 0) return out;
  for (let i = 0; i < raw.length; i++) {
    const r = raw[i];
    const realHeight = heights[r.classId] ?? 1.0;
    const isFlat = (flat[r.classId] ?? 0) === 1;

    let distance: number;
    if (isFlat) {
      const yBottomPx = cropTopPx + (r.y + r.h) * cropSizePx;
      const denom = yBottomPx - horizonPx;
      distance = denom <= 8 ? 80 : (cameraHeightM * focalPx) / denom;
    } else {
      const bboxPx = Math.max(1, r.h * cropSizePx);
      distance = (realHeight * focalPx) / bboxPx;
    }
    if (!isFinite(distance) || distance < 0.4) distance = 0.4;
    if (distance > 80) distance = 80;

    // Map crop-normalized boxes back to full-frame normalized space so the
    // overlay lines up with the camera preview.
    const xFull = (cropLeftPx + r.x * cropSizePx) / uprightWidthPx;
    const yFull = (cropTopPx + r.y * cropSizePx) / uprightHeightPx;
    const wFull = (r.w * cropSizePx) / uprightWidthPx;
    const hFull = (r.h * cropSizePx) / uprightHeightPx;
    const cxFull = (cropLeftPx + r.cx * cropSizePx) / uprightWidthPx;
    const cyFull = (cropTopPx + r.cy * cropSizePx) / uprightHeightPx;

    const zone = cxFull < 0.38 ? 'left' : cxFull > 0.62 ? 'right' : 'center';

    out.push({
      source,
      classId: r.classId,
      score: r.score,
      x: xFull,
      y: yFull,
      w: wFull,
      h: hFull,
      cx: cxFull,
      cy: cyFull,
      distance,
      zone,
    });
  }
  return out;
}
