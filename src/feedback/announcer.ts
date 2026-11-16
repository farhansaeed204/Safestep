import { useCallback, useEffect, useRef } from 'react';
import { FEEDBACK, MODEL } from '@/config';
import { buildAnnouncement, t } from '@/i18n';
import type { AnnotatedDetection } from '@/ml/types';
import type { Settings } from '@/state/settings';
import { pulse } from './haptics';
import { playBeep } from './spatialAudio';
import { speak, stopSpeaking } from './speech';

function intervalForDistance(distance: number): number {
  const ratio = Math.min(1, Math.max(0, distance / FEEDBACK.defaultWarningDistanceM));
  return (
    FEEDBACK.beepIntervalNearMs +
    ratio * (FEEDBACK.beepIntervalFarMs - FEEDBACK.beepIntervalNearMs)
  );
}

export function useAnnouncer(settings: Settings) {
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const lastAnnounceAt = useRef(0);
  const lastKey = useRef('');
  const lastDistance = useRef(Infinity);
  const lastHapticAt = useRef(0);
  const lastBeepAt = useRef(0);
  const lastTop = useRef<AnnotatedDetection | null>(null);
  const lastSeenAt = useRef(0);

  const process = useCallback((detections: AnnotatedDetection[]) => {
    const s = settingsRef.current;
    const now = Date.now();

    if (detections.length === 0) {
      if (lastTop.current != null && now - lastSeenAt.current >= FEEDBACK.resetAfterMs) {
        lastTop.current = null;
        lastKey.current = '';
        lastDistance.current = Infinity;
      }
      return;
    }

    lastSeenAt.current = now;

    let top = detections[0];
    for (let i = 1; i < detections.length; i++) {
      if (detections[i].danger > top.danger) top = detections[i];
    }
    lastTop.current = top;

    const voiceThreshold = Math.max(MODEL.voiceThreshold, s.confidence);
    const actionable = detections.filter(
      (d) =>
        d.score >= voiceThreshold &&
        d.danger >= FEEDBACK.minDanger &&
        d.distance <= s.warningDistanceM,
    );
    if (actionable.length === 0) return;

    let target = actionable[0];
    for (let i = 1; i < actionable.length; i++) {
      if (actionable[i].danger > target.danger) target = actionable[i];
    }

    const key = `${target.source}:${target.classId}:${target.zone}`;
    const closerEnough = lastDistance.current - target.distance >= FEEDBACK.reannounceDeltaM;
    const shouldAnnounce =
      now - lastAnnounceAt.current >= FEEDBACK.announcementCooldownMs &&
      (key !== lastKey.current || closerEnough || target.danger > 0.75);

    if (shouldAnnounce) {
      lastAnnounceAt.current = now;
      lastKey.current = key;
      lastDistance.current = target.distance;
      speak(buildAnnouncement(s.language, target), s.language);
    }

    if (s.haptics && target.distance <= s.warningDistanceM) {
      const interval = intervalForDistance(target.distance) * 1.15;
      if (now - lastHapticAt.current >= interval) {
        lastHapticAt.current = now;
        const level =
          target.distance <= FEEDBACK.criticalDistanceM
            ? 'critical'
            : target.distance <= s.warningDistanceM * 0.6
              ? 'high'
              : 'low';
        pulse(level);
      }
    }

    if (s.spatialAudio && target.distance <= s.warningDistanceM) {
      const interval = intervalForDistance(target.distance);
      if (now - lastBeepAt.current >= interval) {
        lastBeepAt.current = now;
        playBeep(target.zone);
      }
    }
  }, []);

  const repeat = useCallback(() => {
    const s = settingsRef.current;
    const top = lastTop.current;
    speak(top ? buildAnnouncement(s.language, top) : t(s.language, 'hintHome'), s.language);
  }, []);

  const stop = useCallback(() => {
    stopSpeaking();
  }, []);

  return { process, repeat, stop };
}
