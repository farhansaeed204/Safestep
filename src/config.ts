/**
 * Central configuration for SafeStep.
 *
 * After you add the real `.tflite` models to `assets/models/`, set
 * `cameraDetection` to `true` in Settings (or flip `DEFAULT_SETTINGS` below).
 */
export const MODEL = {
  /** Input size the YOLO models were exported with. */
  inputSize: 320,
  /** Raw model candidates below this are discarded before tracking. */
  candidateThreshold: 0.35,
  /** Confirmed tracks below this are shown on screen. */
  displayThreshold: 0.35,
  /** Confirmed tracks below this are spoken. */
  voiceThreshold: 0.65,
  /** IoU threshold used by per-class non-max suppression. */
  iouThreshold: 0.45,
  /** Reject ambiguous labels when the top two classes are too close. */
  classMargin: 0.1,
  /** Only apply the class margin above this score. */
  classMarginMinScore: 0.75,
  /** Suppress near-identical boxes that received different labels. */
  crossClassIouThreshold: 0.8,
  /** Hard cap on detections per frame. */
  maxDetections: 25,
  /** Only keep the middle 40% of the frame (0.30..0.70). */
  centerBand: 0.4,
  /** Ignore detections estimated farther than this. */
  maxDistanceM: 50,
} as const;

export const TRACKER = {
  /** Frames a track must be seen before it reaches screen readers. */
  confirmHits: 4,
  /** Hits are counted over the most recent frames. */
  windowFrames: 6,
  /** Remove a track after this many consecutive missed frames. */
  maxMisses: 3,
  /** Remove a track that has not been seen for this long. */
  expiryMs: 900,
  /** Minimum IoU for matching a detection to an existing track. */
  iouThreshold: 0.3,
} as const;

export const CAMERA = {
  targetWidth: 1280,
  targetHeight: 720,
  /**
   * Portrait vertical field of view (along the long side of the frame), in
   * degrees. Approximate for most phones — distances are labelled as estimates.
   * Lower this if objects feel too close, raise it if they feel too far.
   */
  verticalFovDeg: 65,
  /** Approximate height the phone is held at, in meters (for ground hazards). */
  cameraHeightM: 1.2,
  /** Normalized y of the horizon line in the camera preview. */
  horizonNorm: 0.42,
} as const;

export const FEEDBACK = {
  /** Default distance at which we start warning the user. */
  defaultWarningDistanceM: 20,
  /** Anything closer than this is treated as critical. */
  criticalDistanceM: 5,
  /** Minimum gap between two spoken announcements. */
  announcementCooldownMs: 2200,
  /** If the same object gets this much closer, re-announce early. */
  reannounceDeltaM: 2.5,
  /** Beep intervals based on distance. */
  beepIntervalFarMs: 900,
  beepIntervalNearMs: 350,
  /** Minimum danger score before we start speaking. */
  minDanger: 0.15,
  /** Clear announcement state after this long without detections. */
  resetAfterMs: 1200,
} as const;
