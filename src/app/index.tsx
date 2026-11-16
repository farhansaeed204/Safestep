import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getRealPipeline } from '@/camera/loadRealPipeline';
import { BigButton } from '@/components/BigButton';
import { DebugOverlay, type DebugStats } from '@/components/DebugOverlay';
import { DetectionCard } from '@/components/DetectionCard';
import { DetectionOverlay } from '@/components/DetectionOverlay';
import { useDemoSource } from '@/demo/useDemoSource';
import { useAnnouncer } from '@/feedback/announcer';
import { speak, stopSpeaking } from '@/feedback/speech';
import { buildSceneDescription, t } from '@/i18n';
import { annotateDetections } from '@/ml/annotate';
import { filterDetections, filterRejectReason } from '@/ml/filter';
import { COCO_ALLOWED_IDS, COCO_LABELS } from '@/ml/labels';
import { DetectionTracker } from '@/ml/tracker';
import type { AnnotatedDetection, Detection } from '@/ml/types';
import { useSettings } from '@/state/settings';
import { colors, radius, spacing, typography } from '@/theme';
import { useVoiceCommand, type VoiceCommand } from '@/voice/commands';

const RealPipeline = getRealPipeline();

export default function CameraScreen() {
  const { settings, update } = useSettings();
  const { process: processDetections, repeat } = useAnnouncer(settings);
  const [detections, setDetections] = useState<AnnotatedDetection[]>([]);
  const [debugStats, setDebugStats] = useState<DebugStats | null>(null);
  const lastOverlayAt = useRef(0);
  const lastDebugAt = useRef(0);
  const trackerRef = useRef<DetectionTracker | null>(null);
  const fpsRef = useRef({ frames: 0, startedAt: 0, fps: 0 });

  if (trackerRef.current == null) {
    trackerRef.current = new DetectionTracker();
  }

  const handleDetections = useCallback(
    (raw: Detection[], isDemo: boolean) => {
      const now = Date.now();
      const filterOptions = {
        centerOnly: settings.centerOnly,
        confidence: settings.confidence,
        maxDistanceM: settings.maxDistanceM,
        allowAllClasses: true,
      };
      const filtered = isDemo ? raw : filterDetections(raw, filterOptions);
      const stable = isDemo ? filtered : (trackerRef.current?.update(filtered, now) ?? []);
      const stableAnnotated = annotateDetections(
        stable,
        settings.language,
        settings.warningDistanceM,
      );
      // Show filtered detections immediately for the visual overlay; voice and
      // haptics still wait for the temporal tracker so we do not announce noise.
      const annotated =
        stableAnnotated.length > 0
          ? stableAnnotated
          : annotateDetections(filtered, settings.language, settings.warningDistanceM);

      if (fpsRef.current.startedAt === 0) {
        fpsRef.current.startedAt = now;
      }
      fpsRef.current.frames += 1;
      const elapsed = now - fpsRef.current.startedAt;
      if (elapsed >= 500) {
        fpsRef.current.fps = (fpsRef.current.frames * 1000) / elapsed;
        fpsRef.current.frames = 0;
        fpsRef.current.startedAt = now;
      }

      if (now - lastOverlayAt.current >= 200) {
        lastOverlayAt.current = now;
        setDetections(annotated);
      }
      if (settings.debugOverlay && now - lastDebugAt.current >= 200) {
        lastDebugAt.current = now;
        const top = [...annotated]
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map((d) => ({
            label: d.label,
            score: d.score,
            distance: d.distance,
          }));
        const rawTop = raw
          .filter((d) => d.source === 'coco')
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map((d) => {
            const allowed = COCO_ALLOWED_IDS.has(d.classId);
            const reason = filterRejectReason(d, filterOptions);
            return {
              label: COCO_LABELS[d.classId] ?? `class ${d.classId}`,
              score: d.score,
              cx: d.cx,
              distance: d.distance,
              allowed,
              reason: reason ?? (allowed ? 'ok' : 'visual'),
            };
          });
        setDebugStats({
          raw: raw.length,
          filtered: filtered.length,
          stable: stable.length,
          fps: Math.round(fpsRef.current.fps),
          top,
          rawTop,
        });
      }
      const voiceDetections = stableAnnotated.filter(
        (d) => d.source === 'hazard' || COCO_ALLOWED_IDS.has(d.classId),
      );
      processDetections(voiceDetections);
    },
    [
      settings.centerOnly,
      settings.confidence,
      settings.debugOverlay,
      settings.language,
      settings.maxDistanceM,
      settings.warningDistanceM,
      processDetections,
    ],
  );

  const handleCameraDetections = useCallback(
    (raw: Detection[]) => handleDetections(raw, false),
    [handleDetections],
  );
  const handleDemoDetections = useCallback(
    (raw: Detection[]) => handleDetections(raw, true),
    [handleDetections],
  );

  const useCamera = settings.cameraDetection && RealPipeline != null;
  useDemoSource(!useCamera, handleDemoDetections);

  const goHome = useCallback(() => {
    stopSpeaking();
    router.replace('/home');
  }, []);

  const handleCommand = useCallback(
    (command: VoiceCommand) => {
      if (command === 'stop') {
        goHome();
        return;
      }
      if (command === 'repeat') {
        repeat();
        return;
      }
      if (command === 'describe') {
        speak(buildSceneDescription(settings.language, detections), settings.language);
        return;
      }
      if (command === 'flashlight-on' || command === 'flashlight-off') {
        if (!useCamera) {
          speak(t(settings.language, 'notAvailable'), settings.language);
          return;
        }
        const next = command === 'flashlight-on';
        update({ torchOn: next });
        speak(t(settings.language, next ? 'flashlightOn' : 'flashlightOff'), settings.language);
        return;
      }
      if (command === 'help') {
        speak(t(settings.language, 'voiceHint'), settings.language);
      }
    },
    [detections, repeat, settings.language, goHome, update, useCamera],
  );

  const voice = useVoiceCommand(settings.voiceCommands, settings.language, handleCommand);

  useEffect(() => {
    speak(t(settings.language, 'started'), settings.language);
    return () => stopSpeaking();
  }, [settings.language]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {useCamera && RealPipeline != null ? (
        <RealPipeline
          language={settings.language}
          onDetections={handleCameraDetections}
          onSwitchToDemo={() => update({ cameraDetection: false })}
        />
      ) : (
        <View style={styles.demo}>
          <View style={styles.demoEye}>
            <View style={styles.demoPupil} />
          </View>
          <Text style={styles.demoTitle}>{t(settings.language, 'demoMode')}</Text>
          <Text style={styles.demoNote}>{t(settings.language, 'demoNote')}</Text>
        </View>
      )}

      <DetectionOverlay detections={detections} />
      <DetectionCard detections={detections} language={settings.language} />
      {settings.debugOverlay ? <DebugOverlay stats={debugStats} /> : null}

      <SafeAreaView style={styles.topBar} edges={['top']} pointerEvents="box-none">
        <View style={styles.topRow}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>
              {t(settings.language, useCamera ? 'cameraMode' : 'demoMode')} · {detections.length}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(settings.language, 'settings')}
            onPress={() => router.push('/settings')}
            style={({ pressed }) => [styles.settingsPill, pressed && styles.pressed]}
          >
            <Text style={styles.pillText}>{t(settings.language, 'settings')}</Text>
          </Pressable>
        </View>
        {voice.listening && (
          <View style={[styles.pill, styles.listeningPill]}>
            <Text style={styles.pillText}>{t(settings.language, 'listening')}</Text>
          </View>
        )}
      </SafeAreaView>

      <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
        <View style={styles.row}>
          <BigButton
            label={t(settings.language, 'stop')}
            tone="danger"
            onPress={goHome}
            style={styles.flex}
          />
          <BigButton
            label={t(settings.language, 'repeat')}
            tone="glass"
            onPress={repeat}
            style={styles.flex}
          />
          {settings.voiceCommands && (
            <BigButton
              label={t(settings.language, 'voiceCommand')}
              tone={voice.listening ? 'primary' : 'glass'}
              onPress={voice.listening ? voice.stop : voice.start}
              style={styles.flex}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cameraBg,
  },
  demo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backgroundColor: '#0B0B0F',
  },
  demoEye: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 3,
    borderColor: 'rgba(0, 122, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    backgroundColor: 'rgba(0, 122, 255, 0.12)',
  },
  demoPupil: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.accent,
  },
  demoTitle: {
    ...typography.title,
    color: colors.overlayText,
    textAlign: 'center',
  },
  demoNote: {
    ...typography.body,
    fontWeight: '400',
    color: colors.overlayTextMuted,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 320,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 38,
  },
  pill: {
    backgroundColor: colors.glass,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  settingsPill: {
    position: 'absolute',
    right: 0,
    backgroundColor: colors.glass,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  listeningPill: {
    alignSelf: 'center',
    borderColor: colors.success,
  },
  pillText: {
    color: colors.overlayText,
    fontSize: 13,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.6,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
