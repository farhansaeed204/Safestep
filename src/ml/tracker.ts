import { TRACKER } from '@/config';
import type { Detection, DetectionSource } from './types';

type Track = {
  id: number;
  source: DetectionSource;
  classId: number;
  history: number[];
  misses: number;
  lastSeenAt: number;
  lastDetection: Detection;
};

function hitCount(track: Track): number {
  let total = 0;
  for (const hit of track.history) total += hit;
  return total;
}

function pushHistory(track: Track, hit: number): void {
  track.history.push(hit);
  if (track.history.length > TRACKER.windowFrames) {
    track.history.shift();
  }
}

function iou(a: Detection, b: Detection): number {
  const ix1 = Math.max(a.x, b.x);
  const iy1 = Math.max(a.y, b.y);
  const ix2 = Math.min(a.x + a.w, b.x + b.w);
  const iy2 = Math.min(a.y + a.h, b.y + b.h);
  const inter = Math.max(0, ix2 - ix1) * Math.max(0, iy2 - iy1);
  const union = a.w * a.h + b.w * b.h - inter;
  return union <= 0 ? 0 : inter / union;
}

export class DetectionTracker {
  private tracks: Track[] = [];
  private nextId = 1;

  update(detections: Detection[], now = Date.now()): Detection[] {
    const matchedTracks = new Set<Track>();

    for (const detection of detections) {
      let bestTrack: Track | null = null;
      let bestIou = 0;

      for (const track of this.tracks) {
        if (matchedTracks.has(track)) continue;
        if (now - track.lastSeenAt > TRACKER.expiryMs) continue;
        if (track.source !== detection.source || track.classId !== detection.classId) {
          continue;
        }
        const score = iou(track.lastDetection, detection);
        if (score > bestIou) {
          bestIou = score;
          bestTrack = track;
        }
      }

      if (bestTrack != null && bestIou >= TRACKER.iouThreshold) {
        bestTrack.lastDetection = detection;
        pushHistory(bestTrack, 1);
        bestTrack.misses = 0;
        bestTrack.lastSeenAt = now;
        matchedTracks.add(bestTrack);
      } else {
        const track: Track = {
          id: this.nextId++,
          source: detection.source,
          classId: detection.classId,
          history: [1],
          misses: 0,
          lastSeenAt: now,
          lastDetection: detection,
        };
        this.tracks.push(track);
        matchedTracks.add(track);
      }
    }

    for (const track of this.tracks) {
      if (!matchedTracks.has(track)) {
        track.misses += 1;
        pushHistory(track, 0);
      }
    }

    this.tracks = this.tracks.filter(
      (track) => track.misses <= TRACKER.maxMisses && now - track.lastSeenAt <= TRACKER.expiryMs,
    );

    return this.tracks
      .filter((track) => track.misses === 0 && hitCount(track) >= TRACKER.confirmHits)
      .map((track) => track.lastDetection);
  }

  reset(): void {
    this.tracks = [];
    this.nextId = 1;
  }
}
