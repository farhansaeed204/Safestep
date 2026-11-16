import { MODEL } from '@/config';
import { COCO_ALLOWED_IDS } from './labels';
import type { Detection } from './types';

export type DetectionFilterOptions = {
  centerOnly: boolean;
  confidence: number;
  maxDistanceM: number;
  /** Keep non-safety COCO classes visible; voice/haptics still use the allowlist. */
  allowAllClasses?: boolean;
};

export type FilterRejectReason =
  | 'source'
  | 'class'
  | 'score'
  | 'distance'
  | 'shape'
  | 'edge';

function iou(a: Detection, b: Detection): number {
  const ix1 = Math.max(a.x, b.x);
  const iy1 = Math.max(a.y, b.y);
  const ix2 = Math.min(a.x + a.w, b.x + b.w);
  const iy2 = Math.min(a.y + a.h, b.y + b.h);
  const inter = Math.max(0, ix2 - ix1) * Math.max(0, iy2 - iy1);
  const union = a.w * a.h + b.w * b.h - inter;
  return union <= 0 ? 0 : inter / union;
}

function isPerson(d: Detection): boolean {
  return d.source === 'coco' && d.classId === 0;
}

function isBicycle(d: Detection): boolean {
  return d.source === 'coco' && d.classId === 1;
}

export function filterRejectReason(
  detection: Detection,
  options: DetectionFilterOptions,
): FilterRejectReason | null {
  if (detection.source !== 'coco') return 'source';
  if (!options.allowAllClasses && !COCO_ALLOWED_IDS.has(detection.classId)) {
    return 'class';
  }
  if (detection.score < options.confidence) return 'score';
  if (detection.distance > options.maxDistanceM) return 'distance';
  if (isPerson(detection) && detection.w > detection.h * 1.05) return 'shape';
  const centerLimit = MODEL.centerBand / 2;
  if (options.centerOnly && Math.abs(detection.cx - 0.5) > centerLimit) return 'edge';
  return null;
}

export function filterDetections(
  detections: Detection[],
  options: DetectionFilterOptions,
): Detection[] {
  const filtered = detections
    .filter((d) => filterRejectReason(d, options) == null)
    .map((d) =>
      options.centerOnly && d.zone !== 'center' ? { ...d, zone: 'center' as const } : d,
    );

  return filtered.filter((d, index) => {
    if (!isPerson(d)) return true;
    return !filtered.some(
      (other, otherIndex) =>
        otherIndex !== index &&
        isBicycle(other) &&
        other.w > other.h &&
        other.score >= d.score - 0.1 &&
        iou(d, other) > 0.45,
    );
  });
}
