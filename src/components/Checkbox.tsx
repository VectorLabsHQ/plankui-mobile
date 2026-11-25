import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { haptic } from '../haptics';
import { Glyph } from './Glyph';
import { Text } from './Text';

export type CheckboxProps = {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
};

/** iOS: round check (Reminders style). Android: Material 3 square checkbox. The whole row is the target. */
export function Checkbox({ checked, onChange, label, description, disabled }: CheckboxProps) {
  const t = useTheme();
  const android = t.os === 'android';
  const size = android ? 18 : 22;
  const brutal = t.look.name === 'brutal';
  return (
    <Pressable
      onPress={() => {
        haptic('select');
        onChange(!checked);
      }}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled: !!disabled }}
      accessibilityLabel={label}
      hitSlop={label ? 0 : (t.hit - size) / 2}
      style={{ flexDirection: 'row', alignItems: label ? 'flex-start' : 'center', gap: 12, minHeight: label ? t.hit : undefined, paddingVertical: label ? (t.hit - size) / 2 - 2 : 0, opacity: disabled ? 0.4 : 1 }}
    >
      <View
        style={{
          width: size,
          height: size,
          marginTop: label ? 2 : 0,
          borderRadius: android ? t.look.r(2) : size / 2,
          borderWidth: checked && !brutal ? 0 : brutal ? 2 : android ? 2 : 1.5,
          borderColor: brutal ? t.c.ink : t.c.edge,
          backgroundColor: checked ? t.c.accent : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked ? <Glyph name="check" color={t.c.onAccent} size={size * 0.7} /> : null}
      </View>
      {label ? (
        <View style={{ flex: 1, gap: 2 }}>
          <Text>{label}</Text>
          {description ? <Text variant="subhead" tone="muted">{description}</Text> : null}
        </View>
      ) : null}
    </Pressable>
  );
}
