import type { TextStyle, ViewStyle } from 'react-native';

/**
 * Apple-style light theme tokens for SafeStep.
 * The camera screen stays dark (like the iOS Camera app); everything else
 * uses these light surfaces.
 */
export const colors = {
  background: '#F2F2F7',
  card: '#FFFFFF',
  cardMuted: '#F9F9FB',
  accent: '#007AFF',
  accentSoft: '#E5F0FF',
  success: '#34C759',
  successSoft: '#E8F9ED',
  warning: '#FF9500',
  warningSoft: '#FFF4E5',
  danger: '#FF3B30',
  dangerSoft: '#FFE9E8',
  text: '#1C1C1E',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  separator: '#C6C6C8',
  separatorSoft: '#E5E5EA',
  fill: '#E9E9EE',
  fillStrong: '#D1D1D6',
  white: '#FFFFFF',
  black: '#000000',
  cameraBg: '#000000',
  glass: 'rgba(28, 28, 30, 0.6)',
  glassBorder: 'rgba(255, 255, 255, 0.18)',
  overlayText: '#FFFFFF',
  overlayTextMuted: 'rgba(255, 255, 255, 0.72)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  xxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 24,
  pill: 999,
} as const;

export const typography = {
  largeTitle: { fontSize: 34, fontWeight: '700' } as TextStyle,
  title: { fontSize: 28, fontWeight: '700' } as TextStyle,
  headline: { fontSize: 20, fontWeight: '600' } as TextStyle,
  body: { fontSize: 17, fontWeight: '400' } as TextStyle,
  callout: { fontSize: 16, fontWeight: '500' } as TextStyle,
  subhead: { fontSize: 15, fontWeight: '600' } as TextStyle,
  footnote: { fontSize: 13, fontWeight: '400' } as TextStyle,
  caption: { fontSize: 11, fontWeight: '600' } as TextStyle,
} as const;

export const shadow = {
  card: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  } as ViewStyle,
  subtle: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  } as ViewStyle,
} as const;
