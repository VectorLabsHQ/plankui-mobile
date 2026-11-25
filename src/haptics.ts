// Haptics that never throw: a no-op on web and where expo-haptics is missing.
import { Platform } from 'react-native';
import * as H from 'expo-haptics';

export type HapticKind = 'tap' | 'select' | 'success' | 'warning' | 'error' | 'heavy';

export function haptic(kind: HapticKind = 'tap') {
  if (Platform.OS === 'web') return;
  const run =
    kind === 'select' ? H.selectionAsync()
    : kind === 'heavy' ? H.impactAsync(H.ImpactFeedbackStyle.Heavy)
    : kind === 'tap' ? H.impactAsync(H.ImpactFeedbackStyle.Light)
    : H.notificationAsync(
        kind === 'success' ? H.NotificationFeedbackType.Success
        : kind === 'warning' ? H.NotificationFeedbackType.Warning
        : H.NotificationFeedbackType.Error,
      );
  run.catch(() => {});
}
