import { Stack } from 'expo-router';
import { SettingsProvider } from '@/state/settings';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <SettingsProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </SettingsProvider>
  );
}
