import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  type CameraRef,
} from 'react-native-vision-camera';
import { BigButton } from '@/components/BigButton';
import { speak } from '@/feedback/speech';
import { t } from '@/i18n';
import { useSettings } from '@/state/settings';
import { colors, radius, shadow, spacing, typography } from '@/theme';
import { useObjectDetection } from './useObjectDetection';
import type { RealPipelineProps } from './loadRealPipeline';

export function RealPipeline({ language, onDetections, onSwitchToDemo }: RealPipelineProps) {
  const { hasPermission, canRequestPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const { settings, update } = useSettings();
  const torchOn = settings.torchOn;
  const torchOnRef = useRef(torchOn);
  const announced = useRef({
    permission: false,
    modelLoading: false,
    modelReady: false,
    cameraReady: false,
    error: false,
  });
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraKey, setCameraKey] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const [isAppActive, setIsAppActive] = useState(() => AppState.currentState === 'active');
  const cameraRef = useRef<CameraRef | null>(null);
  const torchAppliedRef = useRef(false);

  useEffect(() => {
    torchOnRef.current = torchOn;
  }, [torchOn]);

  const applyTorch = useCallback(
    async (next: boolean): Promise<'ok' | 'not-ready' | 'unavailable' | 'failed'> => {
      if (device == null || !device.hasTorch) return 'unavailable';
      const controller = cameraRef.current?.controller;
      if (controller == null) return 'not-ready';
      try {
        await controller.setTorchMode(next ? 'on' : 'off');
        return 'ok';
      } catch (error) {
        if (__DEV__) console.warn('[SafeStep] torch update failed', error);
        return 'failed';
      }
    },
    [device],
  );

  useEffect(() => {
    if (device == null || device.hasTorch || !torchOn) return;
    update({ torchOn: false });
    speak(t(language, 'flashlightUnavailable'), language);
  }, [device, language, torchOn, update]);

  useEffect(() => {
    if (!cameraReady || device == null || !device.hasTorch) return;
    if (torchAppliedRef.current === torchOn) return;

    let cancelled = false;
    const desired = torchOn;

    applyTorch(desired).then((result) => {
      if (cancelled) return;
      if (result === 'ok') {
        torchAppliedRef.current = desired;
        return;
      }
      if (result === 'not-ready') return;
      if (desired) {
        update({ torchOn: false });
        speak(t(language, 'flashlightUnavailable'), language);
      } else {
        torchAppliedRef.current = false;
      }
    });

    return () => {
      cancelled = true;
    };
  }, [applyTorch, cameraReady, device, language, torchOn, update]);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => {
        setIsFocused(false);
        if (torchOnRef.current) update({ torchOn: false });
      };
    }, [update]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      const active = state === 'active';
      setIsAppActive(active);
      if (!active && torchOnRef.current) update({ torchOn: false });
    });
    return () => subscription.remove();
  }, [update]);

  const toggleTorch = useCallback(() => {
    if (device == null || !device.hasTorch) {
      speak(t(language, 'flashlightUnavailable'), language);
      return;
    }
    const next = !torchOn;
    update({ torchOn: next });
    speak(t(language, next ? 'flashlightOn' : 'flashlightOff'), language);
  }, [device, language, torchOn, update]);

  const handleFrameProcessed = useCallback(() => {
    if (announced.current.cameraReady) return;
    announced.current.cameraReady = true;
    speak(t(language, 'checkpointCameraReady'), language);
  }, [language]);

  const { frameOutput, status, diagnostics, resetRuntimeError } = useObjectDetection(
    hasPermission,
    onDetections,
    handleFrameProcessed,
  );

  useEffect(() => {
    if (!hasPermission && canRequestPermission) {
      requestPermission().catch(() => {});
    }
  }, [hasPermission, canRequestPermission, requestPermission]);

  useEffect(() => {
    if (!hasPermission || announced.current.permission) return;
    announced.current.permission = true;
    speak(t(language, 'checkpointPermission'), language);
  }, [hasPermission, language]);

  useEffect(() => {
    if (!hasPermission || diagnostics.modelStatus !== 'loading') return;
    if (announced.current.modelLoading) return;
    const timer = setTimeout(() => {
      announced.current.modelLoading = true;
      speak(t(language, 'checkpointModelLoading'), language);
    }, 700);
    return () => clearTimeout(timer);
  }, [hasPermission, diagnostics.modelStatus, language]);

  useEffect(() => {
    if (!hasPermission || diagnostics.modelStatus !== 'ready') return;
    if (announced.current.modelReady) return;
    announced.current.modelReady = true;
    speak(t(language, 'checkpointModelReady'), language);
  }, [hasPermission, diagnostics.modelStatus, language]);

  useEffect(() => {
    if (status !== 'error' || announced.current.error) return;
    announced.current.error = true;
    speak(
      t(
        language,
        diagnostics.modelStatus === 'error' ? 'modelErrorTitle' : 'pipelineErrorTitle',
      ),
      language,
    );
  }, [status, diagnostics.modelStatus, language]);

  const handleCameraStarted = useCallback(() => {
    setCameraError(null);
    setCameraReady(true);
  }, []);

  const handleCameraStopped = useCallback(() => {
    setCameraReady(false);
    torchAppliedRef.current = false;
  }, []);

  const handleCameraError = useCallback((error: Error) => {
    setCameraReady(false);
    torchAppliedRef.current = false;
    setCameraError(error.message || String(error));
  }, []);

  const retryCamera = useCallback(() => {
    setCameraError(null);
    setCameraReady(false);
    torchAppliedRef.current = false;
    setCameraKey((key) => key + 1);
  }, []);

  const retryPipeline = useCallback(() => {
    setCameraError(null);
    announced.current.error = false;
    announced.current.cameraReady = false;
    setCameraReady(false);
    torchAppliedRef.current = false;
    resetRuntimeError();
    setCameraKey((key) => key + 1);
  }, [resetRuntimeError]);

  const diagnosticText = [
    diagnostics.modelStatus !== 'ready'
      ? `model: ${diagnostics.modelStatus}${
          diagnostics.modelError ? ` (${diagnostics.modelError})` : ''
        }`
      : null,
    diagnostics.cpuFallback ? t(language, 'cpuPipeline') : null,
    diagnostics.runtimeError ? `runtime: ${diagnostics.runtimeError}` : null,
    diagnostics.assetUri ? `asset: ${diagnostics.assetUri}` : null,
    diagnostics.assetLocalUri ? `local: ${diagnostics.assetLocalUri}` : null,
  ]
    .filter((line): line is string => line != null)
    .join('\n');

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <View style={styles.card}>
          <Text style={styles.title}>{t(language, 'permissionTitle')}</Text>
          <Text style={styles.body}>{t(language, 'permissionBody')}</Text>
          <BigButton
            label={t(language, 'grant')}
            onPress={() => {
              requestPermission().catch(() => {});
            }}
          />
          <BigButton
            label={t(language, 'demoMode')}
            tone="neutral"
            onPress={onSwitchToDemo}
          />
        </View>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.center}>
        <View style={styles.card}>
          <Text style={styles.body}>{t(language, 'noCamera')}</Text>
          <BigButton
            label={t(language, 'demoMode')}
            tone="neutral"
            onPress={onSwitchToDemo}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <Camera
        key={cameraKey}
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isFocused && isAppActive}
        orientationSource="interface"
        outputs={[frameOutput]}
        onStarted={handleCameraStarted}
        onStopped={handleCameraStopped}
        onError={handleCameraError}
      />

      {cameraError == null && device.hasTorch ? (
        <SafeAreaView style={styles.torchBar} edges={['top']} pointerEvents="box-none">
          <Pressable
            accessibilityRole="switch"
            accessibilityLabel={t(language, 'flashlight')}
            accessibilityState={{ checked: torchOn }}
            onPress={toggleTorch}
            style={({ pressed }) => [styles.torchButton, pressed && styles.torchPressed]}
          >
            <Text style={styles.torchText}>
              {t(language, torchOn ? 'flashlightOn' : 'flashlightOff')}
            </Text>
          </Pressable>
        </SafeAreaView>
      ) : null}

      {cameraError != null ? (
        <View style={styles.centerOverlay} pointerEvents="box-none">
          <View style={styles.card}>
            <Text style={styles.title}>{t(language, 'cameraErrorTitle')}</Text>
            <Text style={styles.body}>{t(language, 'cameraDisabled')}</Text>
            <Text style={styles.detail} numberOfLines={3}>
              {cameraError}
            </Text>
            <BigButton label={t(language, 'retry')} onPress={retryCamera} />
            <BigButton
              label={t(language, 'openSettings')}
              tone="neutral"
              onPress={() => {
                Linking.openSettings().catch(() => {});
              }}
            />
            <BigButton
              label={t(language, 'demoMode')}
              tone="neutral"
              onPress={onSwitchToDemo}
            />
          </View>
        </View>
      ) : status === 'loading' || status === 'error' ? (
        <View style={styles.banner}>
          {status === 'loading' ? <ActivityIndicator color={colors.accent} /> : null}
          <Text style={styles.bannerTitle}>
            {status === 'error'
              ? diagnostics.modelStatus === 'error'
                ? t(language, 'modelErrorTitle')
                : t(language, 'pipelineErrorTitle')
              : t(language, 'loadingModels')}
          </Text>
          {status === 'error' ? (
            <>
              <Text style={styles.bannerBody}>
                {diagnostics.modelStatus === 'error'
                  ? t(language, 'modelError')
                  : t(language, 'pipelineErrorBody')}
              </Text>
              {diagnosticText.length > 0 ? (
                <Text style={styles.diagnostic} numberOfLines={8}>
                  {diagnosticText}
                </Text>
              ) : null}
              <BigButton label={t(language, 'retry')} compact onPress={retryPipeline} />
              <BigButton
                label={t(language, 'demoMode')}
                tone="neutral"
                compact
                onPress={onSwitchToDemo}
              />
            </>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.cameraBg,
  },
  centerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  torchBar: {
    position: 'absolute',
    top: 0,
    left: spacing.md,
    alignItems: 'flex-start',
    zIndex: 5,
  },
  torchButton: {
    backgroundColor: colors.glass,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  torchPressed: {
    opacity: 0.65,
  },
  torchText: {
    color: colors.overlayText,
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
    ...shadow.card,
  },
  title: {
    ...typography.headline,
    color: colors.text,
    textAlign: 'center',
  },
  body: {
    ...typography.callout,
    fontWeight: '400',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 23,
  },
  detail: {
    ...typography.footnote,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  diagnostic: {
    ...typography.footnote,
    color: colors.textTertiary,
    textAlign: 'left',
    alignSelf: 'stretch',
  },
  banner: {
    position: 'absolute',
    top: 96,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    alignItems: 'center',
    ...shadow.card,
  },
  bannerTitle: {
    ...typography.callout,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  bannerBody: {
    ...typography.footnote,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
