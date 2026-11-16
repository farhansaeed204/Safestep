export type Zone = 'left' | 'center' | 'right';

export type DetectionSource = 'coco' | 'hazard';

/** Raw detection produced inside the camera worklet. */
export type Detection = {
  source: DetectionSource;
  classId: number;
  score: number;
  /** Normalized box (0..1) relative to the frame. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Normalized center. */
  cx: number;
  cy: number;
  /** Approximate distance in meters. */
  distance: number;
  zone: Zone;
};

/** Detection enriched with labels + danger score on the JS thread. */
export type AnnotatedDetection = Detection & {
  label: string;
  labelLocal: string;
  priority: number;
  danger: number;
};

export type Language = 'en' | 'ur';
