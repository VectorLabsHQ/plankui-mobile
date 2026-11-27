import { Platform, Switch as RNSwitch } from 'react-native';
import { useTheme } from '../theme';
import { haptic } from '../haptics';

export type SwitchProps = {
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
  /** Required when the switch has no visible label next to it. */
  accessibilityLabel?: string;
};

/** The platform's own switch, white thumb on an accent track. */
export function Switch({ value, onValueChange, disabled, accessibilityLabel }: SwitchProps) {
  const t = useTheme();
  return (
    <RNSwitch
      value={value}
      onValueChange={(v) => {
        haptic('select');
        onValueChange(v);
      }}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      trackColor={{ false: t.c.fill, true: t.c.accent }}
      thumbColor="#ffffff"
      ios_backgroundColor={t.c.fill}
      // react-native-web colours the thumb from this prop
      {...(Platform.OS === 'web' ? { activeThumbColor: '#ffffff' } : null)}
    />
  );
}
