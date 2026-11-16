/**
 * Model label maps + per-class metadata.
 *
 * IMPORTANT: The order of `COCO_LABELS` and `HAZARD_LABELS` must match the
 * class order used while training/exporting your TFLite models.
 *
 * The default hazard order is: pothole, manhole, stairs, door, window, wall.
 */

export const COCO_LABELS: string[] = [
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
  'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat',
  'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack',
  'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
  'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
  'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
  'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair',
  'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse',
  'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink', 'refrigerator',
  'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush',
];

/**
 * v6 precision allowlist. Everything outside this set is discarded before it
 * reaches the tracker, overlay or announcer.
 */
export const COCO_ALLOWED_IDS = new Set<number>([
  0, 1, 2, 3, 5, 6, 7, // person, bicycle, car, motorcycle, bus, train, truck
  14, 15, 16, 17, 18, 19, 20, 21, 22, 23, // bird through giraffe
  56, 57, 59, 60, // chair, couch, bed, dining table
]);

export const COCO_ALLOWED_LABELS: string[] = COCO_LABELS.filter((_, id) =>
  COCO_ALLOWED_IDS.has(id),
);

export const HAZARD_LABELS: string[] = [
  'pothole', 'manhole', 'stairs', 'door', 'window', 'wall',
];

export const HAZARD_LABELS_UR: string[] = [
  'گڑھا', 'مین ہول', 'سیڑھیاں', 'دروازہ', 'کھڑکی', 'دیوار',
];

/** Approximate real-world height in meters, used for monocular distance. */
const COCO_HEIGHTS: Record<string, number> = {
  person: 1.7, bicycle: 1.1, car: 1.5, motorcycle: 1.2, bus: 3.2, train: 3.6,
  truck: 3.2, boat: 1.5, bench: 0.9, bird: 0.2, cat: 0.3, dog: 0.55, horse: 1.6,
  sheep: 0.9, cow: 1.4, elephant: 3.0, bear: 2.0, zebra: 1.5, giraffe: 4.5,
  chair: 1.0, couch: 0.9, 'potted plant': 0.8, bed: 0.6, 'dining table': 0.75,
  toilet: 0.8, tv: 0.7, laptop: 0.3, 'cell phone': 0.15, backpack: 0.45,
  umbrella: 0.9, handbag: 0.3, suitcase: 0.6, 'traffic light': 1.0,
  'fire hydrant': 0.8, 'stop sign': 0.75,
};

/** Higher = more important to warn about. */
const COCO_PRIORITIES: Record<string, number> = {
  person: 0.9, bicycle: 0.85, car: 1.0, motorcycle: 0.95, bus: 1.0, train: 1.0,
  truck: 1.0, dog: 0.8, cat: 0.65, cow: 0.85, horse: 0.85, sheep: 0.75,
  'traffic light': 0.5, 'fire hydrant': 0.7, 'stop sign': 0.6, bench: 0.6,
  chair: 0.55, 'potted plant': 0.4, 'dining table': 0.5, couch: 0.45,
};

export const COCO_HEIGHT_ARRAY: number[] = COCO_LABELS.map((l) => COCO_HEIGHTS[l] ?? 1.0);
export const COCO_PRIORITY_ARRAY: number[] = COCO_LABELS.map((l) => COCO_PRIORITIES[l] ?? 0.4);
/** 1 = flat ground hazard (use ground-plane distance), 0 = upright object. */
export const COCO_FLAT_ARRAY: number[] = COCO_LABELS.map(() => 0);

export const HAZARD_HEIGHT_ARRAY: number[] = [0.2, 0.2, 0.2, 2.0, 1.2, 2.5];
export const HAZARD_PRIORITY_ARRAY: number[] = [0.95, 0.9, 0.9, 0.5, 0.45, 0.85];
export const HAZARD_FLAT_ARRAY: number[] = [1, 1, 1, 0, 0, 0];

/** Urdu names for common COCO classes. Falls back to English when missing. */
export const COCO_LABELS_UR: Record<string, string> = {
  person: 'انسان', bicycle: 'سائیکل', car: 'گاڑی', motorcycle: 'موٹر سائیکل',
  bus: 'بس', train: 'ٹرین', truck: 'ٹرک', boat: 'کشتی', bench: 'بینچ',
  bird: 'پرندہ', cat: 'بلی', dog: 'کتا', horse: 'گھوڑا', sheep: 'بھیڑ',
  cow: 'گائے', elephant: 'ہاتھی', bear: 'ریچھ', zebra: 'زیبرا', giraffe: 'زرافہ',
  chair: 'کرسی', couch: 'صوفہ', 'dining table': 'میز', toilet: 'ٹوائلٹ',
  'potted plant': 'پودا', bed: 'بستر', 'stop sign': 'اسٹاپ سائن',
  'traffic light': 'ٹریفک لائٹ', 'fire hydrant': 'فائر ہائیڈرنٹ',
};
