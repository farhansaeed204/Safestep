import { CAMERA } from '@/config';
import {
  COCO_FLAT_ARRAY,
  COCO_HEIGHT_ARRAY,
  COCO_LABELS,
  COCO_LABELS_UR,
  COCO_PRIORITY_ARRAY,
  HAZARD_FLAT_ARRAY,
  HAZARD_HEIGHT_ARRAY,
  HAZARD_LABELS,
  HAZARD_LABELS_UR,
  HAZARD_PRIORITY_ARRAY,
} from './labels';
import type { AnnotatedDetection, Detection, Language } from './types';

/** Worklet-side metadata needed by the frame processor. */
export const MODEL_META = {
  coco: {
    labels: COCO_LABELS,
    heights: COCO_HEIGHT_ARRAY,
    priorities: COCO_PRIORITY_ARRAY,
    flat: COCO_FLAT_ARRAY,
  },
  hazard: {
    labels: HAZARD_LABELS,
    heights: HAZARD_HEIGHT_ARRAY,
    priorities: HAZARD_PRIORITY_ARRAY,
    flat: HAZARD_FLAT_ARRAY,
  },
} as const;

export function focalLengthPx(frameHeightPx: number, verticalFovDeg = CAMERA.verticalFovDeg): number {
  'worklet';
  return frameHeightPx / (2 * Math.tan((verticalFovDeg * Math.PI) / 360));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Attach labels + a 0..1 danger score to each detection. Runs on the JS thread. */
export function annotateDetections(
  detections: Detection[],
  language: Language,
  warningDistanceM: number,
): AnnotatedDetection[] {
  return detections.map((d) => {
    const meta = d.source === 'coco' ? MODEL_META.coco : MODEL_META.hazard;
    const label = meta.labels[d.classId] ?? `class ${d.classId}`;
    const labelLocal =
      d.source === 'hazard'
        ? HAZARD_LABELS_UR[d.classId] ?? label
        : COCO_LABELS_UR[label] ?? label;
    const priority = meta.priorities[d.classId] ?? 0.5;

    const proximity = clamp(1 - d.distance / Math.max(1, warningDistanceM), 0, 1);
    const zoneWeight = d.zone === 'center' ? 1 : 0.78;
    const danger = clamp(Math.pow(proximity, 0.85) * priority * zoneWeight, 0, 1);

    return {
      ...d,
      label,
      labelLocal,
      priority,
      danger,
    };
  });
}
