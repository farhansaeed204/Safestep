import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BigButton } from '@/components/BigButton';
import { t } from '@/i18n';
import { useSettings } from '@/state/settings';
import { colors, radius, shadow, spacing, typography } from '@/theme';

export default function SettingsScreen() {
  const { settings, update } = useSettings();
  const language = settings.language;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t(language, 'settings')}</Text>

        <Section title={t(language, 'language')}>
          <View style={styles.segmentRow}>
            <Segment
              label={t(language, 'english')}
              active={language === 'en'}
              onPress={() => update({ language: 'en' })}
            />
            <Segment
              label={t(language, 'urdu')}
              active={language === 'ur'}
              onPress={() => update({ language: 'ur' })}
            />
          </View>
        </Section>

        <Section title={t(language, 'warningDistance')}>
          <View style={styles.segmentRow}>
            {[10, 20, 30, 50].map((meters) => (
              <Segment
                key={meters}
                label={`${meters}m`}
                active={settings.warningDistanceM === meters}
                onPress={() => update({ warningDistanceM: meters })}
              />
            ))}
          </View>
        </Section>

        <Section title={t(language, 'detection')}>
          <ToggleRow
            label={t(language, 'centerOnly')}
            hint={t(language, 'centerOnlyHint')}
            value={settings.centerOnly}
            onToggle={() => update({ centerOnly: !settings.centerOnly })}
            divider
          />
          <View style={styles.settingBlock}>
            <Text style={styles.settingLabel}>{t(language, 'detectionRange')}</Text>
            <View style={styles.segmentRow}>
              {[30, 40, 50].map((meters) => (
                <Segment
                  key={meters}
                  label={`${meters}m`}
                  active={settings.maxDistanceM === meters}
                  onPress={() => update({ maxDistanceM: meters })}
                />
              ))}
            </View>
          </View>
          <View style={styles.settingBlock}>
            <Text style={styles.settingLabel}>{t(language, 'confidence')}</Text>
            <View style={styles.segmentRow}>
              {[0.35, 0.4, 0.45, 0.5, 0.55, 0.6].map((value) => (
                <Segment
                  key={value}
                  label={`${Math.round(value * 100)}%`}
                  active={Math.abs(settings.confidence - value) < 0.001}
                  onPress={() => update({ confidence: value })}
                />
              ))}
            </View>
          </View>
          <ToggleRow
            label={t(language, 'debugOverlay')}
            hint={t(language, 'debugOverlayHint')}
            value={settings.debugOverlay}
            onToggle={() => update({ debugOverlay: !settings.debugOverlay })}
          />
        </Section>

        <Section title={t(language, 'targets')}>
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>{t(language, 'targetsBody')}</Text>
          </View>
        </Section>

        <Section title={t(language, 'cameraDetection')}>
          <ToggleRow
            label={t(language, 'cameraDetection')}
            hint={t(language, 'cameraDetectionHint')}
            value={settings.cameraDetection}
            onToggle={() => update({ cameraDetection: !settings.cameraDetection })}
            divider
          />
          <ToggleRow
            label={t(language, 'haptics')}
            value={settings.haptics}
            onToggle={() => update({ haptics: !settings.haptics })}
            divider
          />
          <ToggleRow
            label={t(language, 'spatialAudio')}
            value={settings.spatialAudio}
            onToggle={() => update({ spatialAudio: !settings.spatialAudio })}
            divider
          />
          <ToggleRow
            label={t(language, 'voiceCommands')}
            hint={t(language, 'voiceHint')}
            value={settings.voiceCommands}
            onToggle={() => update({ voiceCommands: !settings.voiceCommands })}
          />
        </Section>

        <View style={styles.back}>
          <BigButton
            label={t(language, 'back')}
            tone="neutral"
            onPress={() => router.back()}
          />
        </View>

        <Text style={styles.about}>{t(language, 'aboutBody')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.group}>{children}</View>
    </View>
  );
}

function Segment({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.segment,
        active && styles.segmentActive,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>{label}</Text>
    </Pressable>
  );
}

type ToggleRowProps = {
  label: string;
  hint?: string;
  value: boolean;
  onToggle: () => void;
  divider?: boolean;
};

function ToggleRow({ label, hint, value, onToggle, divider = false }: ToggleRowProps) {
  return (
    <View style={[styles.toggleRow, divider && styles.toggleDivider]}>
      <View style={styles.toggleText}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {hint ? <Text style={styles.toggleHint}>{hint}</Text> : null}
      </View>
      <Switch
        accessibilityLabel={label}
        accessibilityHint={hint}
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.fillStrong, true: colors.success }}
        thumbColor={colors.white}
        ios_backgroundColor={colors.fillStrong}
      />
    </View>
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
  title: {
    ...typography.largeTitle,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginLeft: spacing.md,
    marginBottom: spacing.sm,
  },
  group: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadow.subtle,
  },
  segmentRow: {
    flexDirection: 'row',
    padding: spacing.xs,
    gap: spacing.xs,
  },
  settingBlock: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separatorSoft,
    paddingBottom: spacing.sm,
  },
  settingLabel: {
    ...typography.subhead,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  infoRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  infoText: {
    ...typography.footnote,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  segment: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.fill,
  },
  segmentActive: {
    backgroundColor: colors.accent,
  },
  segmentLabel: {
    ...typography.subhead,
    color: colors.text,
  },
  segmentLabelActive: {
    color: colors.white,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: 13,
    gap: spacing.md,
  },
  toggleDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separatorSoft,
  },
  toggleText: {
    flex: 1,
  },
  toggleLabel: {
    ...typography.body,
    fontWeight: '500',
    color: colors.text,
  },
  toggleHint: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginTop: 3,
  },
  back: {
    marginTop: spacing.xl,
  },
  about: {
    ...typography.footnote,
    color: colors.textTertiary,
    lineHeight: 20,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});
