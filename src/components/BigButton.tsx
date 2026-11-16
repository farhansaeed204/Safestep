import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

export type ButtonTone = 'primary' | 'danger' | 'neutral' | 'glass';

type Props = {
  label: string;
  onPress: () => void;
  tone?: ButtonTone;
  compact?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  hint?: string;
};

const TONE_STYLE: Record<ButtonTone, ViewStyle> = {
  primary: { backgroundColor: colors.accent },
  danger: { backgroundColor: colors.danger },
  neutral: { backgroundColor: colors.fill },
  glass: {
    backgroundColor: colors.glass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
};

const TONE_LABEL: Record<ButtonTone, string> = {
  primary: colors.white,
  danger: colors.white,
  neutral: colors.accent,
  glass: colors.overlayText,
};

export function BigButton({
  label,
  onPress,
  tone = 'primary',
  compact = false,
  disabled = false,
  style,
  hint,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        compact ? styles.compact : styles.large,
        TONE_STYLE[tone],
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[styles.label, compact && styles.labelCompact, { color: TONE_LABEL[tone] }]}
        numberOfLines={2}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  large: {
    minHeight: 58,
    marginVertical: 6,
  },
  compact: {
    minHeight: 44,
    marginVertical: 4,
    paddingHorizontal: spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    ...typography.headline,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  labelCompact: {
    fontSize: 15,
  },
});
