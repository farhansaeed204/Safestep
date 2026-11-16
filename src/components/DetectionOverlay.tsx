import { StyleSheet, Text, View } from 'react-native';
import type { AnnotatedDetection } from '@/ml/types';
import { colors, radius } from '@/theme';

function pct(n: number): `${number}%` {
  const clamped = Math.max(0, Math.min(100, n * 100));
  return `${clamped}%`;
}

function colorFor(danger: number): string {
  if (danger > 0.6) return colors.danger;
  if (danger > 0.3) return colors.warning;
  return 'rgba(255, 255, 255, 0.9)';
}

/**
 * Draws subtle bounding boxes on top of the camera preview. Mostly for sighted
 * helpers and demos — the blind user relies on voice/haptics instead.
 */
export function DetectionOverlay({ detections }: { detections: AnnotatedDetection[] }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {detections.map((d, index) => {
        const color = colorFor(d.danger);
        return (
          <View
            key={`${d.source}-${d.classId}-${index}`}
            style={[
              styles.box,
              {
                left: pct(d.x),
                top: pct(d.y),
                width: pct(d.w),
                height: pct(d.h),
                borderColor: color,
              },
            ]}
          >
            <Text numberOfLines={1} style={styles.label}>
              {d.label} · {Math.round(d.distance)}m
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: radius.sm,
  },
  label: {
    position: 'absolute',
    top: -20,
    left: -2,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: 'rgba(28, 28, 30, 0.85)',
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
});
