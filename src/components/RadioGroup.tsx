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

/** One choice from a short list. iOS: a checkmark on the chosen row. Android: Material radio buttons. */
export function RadioGroup({ options, value, onChange, accessibilityLabel }: RadioGroupProps) {
  const t = useTheme();
  const android = t.os === 'android';
  const brutal = t.look.name === 'brutal';
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
              minHeight: android ? 56 : t.hit,
              paddingVertical: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
              borderTopWidth: !android && i ? 0.5 : 0,
              borderColor: t.c.rule,
              opacity: pressed && !android ? 0.6 : 1,
            })}
          >
            {android ? (
              <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: on ? t.c.accent : brutal ? t.c.ink : t.c.edge, alignItems: 'center', justifyContent: 'center' }}>
                {on ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: t.c.accent }} /> : null}
              </View>
            ) : null}
            <View style={{ flex: 1, gap: 2 }}>
              <Text>{o.label}</Text>
              {o.description ? <Text variant="subhead" tone="muted">{o.description}</Text> : null}
            </View>
            {!android && on ? <Glyph name="check" color={t.c.accent} size={18} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}
