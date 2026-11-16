import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BigButton } from '@/components/BigButton';
import { t } from '@/i18n';
import { useSettings } from '@/state/settings';
import { colors, radius, shadow, spacing, typography } from '@/theme';

export default function HomeScreen() {
  const { settings } = useSettings();
  const language = settings.language;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <View style={styles.eye}>
            <View style={styles.pupil} />
            <View style={styles.glint} />
          </View>
          <Text style={styles.title}>{t(language, 'appName')}</Text>
          <Text style={styles.tagline}>{t(language, 'tagline')}</Text>
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>{t(language, 'offlineBadge')}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <BigButton
            label={t(language, 'startNavigation')}
            hint={t(language, 'hintHome')}
            onPress={() => router.push('/')}
          />
          <BigButton
            label={t(language, 'settings')}
            tone="neutral"
            onPress={() => router.push('/settings')}
          />
        </View>

        <Text style={styles.hint}>{t(language, 'hintHome')}</Text>
        <Text style={styles.about}>{t(language, 'aboutBody')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.xl,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  eye: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.15)',
    marginBottom: spacing.lg,
  },
  pupil: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
  },
  glint: {
    position: 'absolute',
    top: 34,
    left: 38,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  title: {
    ...typography.largeTitle,
    color: colors.text,
    textAlign: 'center',
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.successSoft,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  badgeText: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.success,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.lg,
    ...shadow.subtle,
  },
  hint: {
    ...typography.callout,
    color: colors.textSecondary,
    lineHeight: 23,
    textAlign: 'center',
  },
  about: {
    ...typography.footnote,
    color: colors.textTertiary,
    lineHeight: 20,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});
