import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { haptic } from '../haptics';
import { Glyph } from './Glyph';
import { Text } from './Text';

export type RadioOption = { value: string; label: string; description?: string };

export type RadioGroupProps = {
  options: RadioOption[];
  value: string;
  onChange: (v: string) => void;
  accessibilityLabel?: string;
};

/** One choice from a short list: a checkmark on the chosen row. */
export function RadioGroup({ options, value, onChange, accessibilityLabel }: RadioGroupProps) {
  const t = useTheme();
  const ripple = t.os === 'android'; // ripple instead of a fade
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel}>
      {options.map((o, i) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => {
              if (!on) haptic('select');
              onChange(o.value);
            }}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            accessibilityLabel={o.label}
            android_ripple={{ color: t.wash(t.c.ink) }}
            style={({ pressed }) => ({
              minHeight: t.hit,
              paddingVertical: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
              borderTopWidth: i ? 0.5 : 0,
              borderColor: t.c.rule,
              opacity: pressed && !ripple ? 0.6 : 1,
            })}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text>{o.label}</Text>
              {o.description ? <Text variant="subhead" tone="muted">{o.description}</Text> : null}
            </View>
            {on ? <Glyph name="check" color={t.c.accent} size={18} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}
