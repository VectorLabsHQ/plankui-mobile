import { Platform, Switch as RNSwitch } from 'react-native';
import { useTheme, withAlpha } from '../theme';
import { haptic } from '../haptics';

export type SwitchProps = {
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
  /** Required when the switch has no visible label next to it. */
  accessibilityLabel?: string;
};

/** The platform's own switch (iOS green-style track, Material thumb), in the accent colour. */
export function Switch({ value, onValueChange, disabled, accessibilityLabel }: SwitchProps) {
  const t = useTheme();
  const android = Platform.OS === 'android';
  return (
    <RNSwitch
      value={value}
      onValueChange={(v) => {
        haptic('select');
        onValueChange(v);
      }}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      trackColor={{ false: t.c.fill, true: android ? withAlpha(t.c.accent, 0.5) : t.c.accent }}
      thumbColor={android ? (value ? t.c.accent : t.c.muted) : '#ffffff'}
      ios_backgroundColor={t.c.fill}
      // react-native-web colours the thumb from this prop
      {...(Platform.OS === 'web' ? { activeThumbColor: '#ffffff' } : null)}
    />
  );
}
