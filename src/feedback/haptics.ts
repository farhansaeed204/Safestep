import * as Haptics from 'expo-haptics';
import { Vibration } from 'react-native';

export type HapticLevel = 'low' | 'high' | 'critical';

/** Fire a vibration pattern matching how close the obstacle is. */
export function pulse(level: HapticLevel): void {
  if (level === 'critical') {
    Vibration.vibrate([0, 150, 70, 150]);
    return;
  }
  const style =
    level === 'high'
      ? Haptics.ImpactFeedbackStyle.Heavy
      : Haptics.ImpactFeedbackStyle.Light;
  Haptics.impactAsync(style).catch(() => {});
}

export function notify() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
