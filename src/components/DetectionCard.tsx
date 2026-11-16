import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { t, zonePhrase } from '@/i18n';
import type { AnnotatedDetection, Language } from '@/ml/types';
import { colors, radius, shadow, spacing, typography } from '@/theme';

type Props = {
  detections: AnnotatedDetection[];
  language: Language;
};

const STICKY_MS = 900;

function dotColor(danger: number): string {
  if (danger > 0.6) return colors.danger;
  if (danger > 0.3) return colors.warning;
  return colors.success;
}

function mostDangerous(detections: AnnotatedDetection[]): AnnotatedDetection {
  return detections.reduce((best, d) => (d.danger > best.danger ? d : best));
}

/**
 * Centered, glanceable card showing the single most dangerous detection.
 * Decorative only — screen readers skip it because the same information is
 * spoken through TTS.
 */
export function DetectionCard({ detections, language }: Props) {
  const [shown, setShown] = useState<AnnotatedDetection | null>(null);
  const [count, setCount] = useState(0);
  const [opacity] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(0.94));
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameRef = useRef<number | null>(null);
  const generation = useRef(0);

  useEffect(() => {
    if (detections.length === 0) return;

    const gen = ++generation.current;
    const top = mostDangerous(detections);
    const total = detections.length;

    opacity.stopAnimation();
    scale.stopAnimation();
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 90,
        useNativeDriver: true,
      }),
    ]).start();

    // Update the visible content on the next frame so this effect only drives
    // the animation instead of synchronously triggering a second render.
    if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      if (generation.current === gen) {
        setShown(top);
        setCount(total);
      }
    });

    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.96, duration: 220, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished && generation.current === gen) {
          setShown(null);
        }
      });
    }, STICKY_MS);
  }, [detections, opacity, scale]);

  useEffect(
    () => () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  if (shown == null) return null;

  const label = language === 'ur' ? shown.labelLocal : shown.label;
  const meters = Math.max(1, Math.round(shown.distance));
  const zone = zonePhrase(language, shown.zone);

  return (
    <View
      pointerEvents="none"
      style={styles.wrap}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
        <View style={styles.header}>
          <View style={[styles.dot, { backgroundColor: dotColor(shown.danger) }]} />
          <Text style={styles.label} numberOfLines={1}>
            {label}
          </Text>
          {count > 1 ? <Text style={styles.count}>×{count}</Text> : null}
        </View>
        <Text style={styles.distance}>
          {meters} {t(language, 'meters')}
        </Text>
        <Text style={styles.zone}>{zone}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: '38%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  card: {
    minWidth: 200,
    maxWidth: 270,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    alignItems: 'center',
    ...shadow.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
  },
  label: {
    ...typography.headline,
    color: colors.text,
    flexShrink: 1,
  },
  count: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  distance: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
    letterSpacing: 0.3,
  },
  zone: {
    ...typography.subhead,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 2,
  },
});
