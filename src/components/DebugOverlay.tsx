import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';

export type DebugStats = {
  raw: number;
  filtered: number;
  stable: number;
  fps: number;
  top: { label: string; score: number; distance: number }[];
  rawTop: {
    label: string;
    score: number;
    cx: number;
    distance: number;
    allowed: boolean;
    reason: string;
  }[];
};

export function DebugOverlay({ stats }: { stats: DebugStats | null }) {
  if (stats == null) return null;

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Text style={styles.headline}>
        RAW {stats.raw} A� FILTER {stats.filtered} A� STABLE {stats.stable} A� FPS {stats.fps}
      </Text>
      {stats.rawTop.map((item, index) => (
        <Text key={`raw-${item.label}-${index}`} style={styles.row} numberOfLines={1}>
          {item.allowed ? 'voice' : 'visual'} {item.label} {item.score.toFixed(2)} cx{' '}
          {item.cx.toFixed(2)} {Math.round(item.distance)}m [{item.reason}]
        </Text>
      ))}
      {stats.top.map((item, index) => (
        <Text key={`${item.label}-${index}`} style={styles.row} numberOfLines={1}>
          {item.label} {item.score.toFixed(2)} · {Math.round(item.distance)}m
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: 104,
    padding: spacing.md,
    gap: 3,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  headline: {
    color: colors.overlayText,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
  row: {
    color: colors.overlayTextMuted,
    fontFamily: 'monospace',
    fontSize: 11,
  },
});
