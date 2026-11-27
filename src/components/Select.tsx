import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useTheme } from '../theme';
import { haptic } from '../haptics';
import { Glyph } from './Glyph';
import { ListItem } from './List';
import { Sheet } from './Sheet';
import { Text } from './Text';

export type SelectOption = { value: string; label: string; description?: string; disabled?: boolean };

export type SelectProps = {
  label: string;
  value: string | null;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
};

/**
 * A field that opens a sheet of options and closes on a pick. Looks like TextField
 * with a chevron, so forms stay one style.
 */
export function Select({ label, value, options, onChange, placeholder = 'Choose', hint, error, disabled }: SelectProps) {
  const t = useTheme();
  const ripple = t.os === 'android'; // ripple instead of a fade
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <View style={{ gap: 6, opacity: disabled ? 0.5 : 1 }}>
      <Text variant="footnote" tone={error ? 'danger' : 'ink2'} weight="500">
        {label}
      </Text>
      <Pressable
        disabled={disabled}
        onPress={() => {
          haptic('select');
          setOpen(true);
        }}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${current?.label ?? placeholder}`}
        accessibilityHint={error ?? hint}
        accessibilityState={{ disabled: !!disabled, expanded: open }}
        android_ripple={{ color: t.wash(t.c.ink) }}
        style={({ pressed }) => ({
          minHeight: 44,
          paddingHorizontal: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          overflow: 'hidden',
          ...(t.look.field),
          borderRadius: t.look.r(10),
          borderWidth: Math.max(1.5, Number(t.look.field.borderWidth ?? 0)),
          borderColor: error ? t.c.danger : (t.look.field.borderColor as string),
          backgroundColor: (t.look.field.backgroundColor as string),
          opacity: pressed && !ripple ? 0.7 : 1,
        })}
      >
        <Text style={{ flex: 1, fontSize: 16, color: current ? t.c.ink : t.c.muted }} numberOfLines={1}>
          {current?.label ?? placeholder}
        </Text>
        <View style={{ transform: [{ rotate: '90deg' }] }}>
          <Glyph name="chevron-right" color={t.c.muted} size={12} />
        </View>
      </Pressable>
      {error || hint ? (
        <Text variant="footnote" tone={error ? 'danger' : 'muted'} accessibilityLiveRegion={error ? 'polite' : 'none'}>
          {error ?? hint}
        </Text>
      ) : null}
      <Sheet open={open} onClose={() => setOpen(false)} title={label}>
        <ScrollView style={{ marginHorizontal: -16 }} accessibilityRole="radiogroup">
          {options.map((o) => (
            <View key={o.value} style={{ opacity: o.disabled ? 0.4 : 1 }} pointerEvents={o.disabled ? 'none' : 'auto'}>
              <ListItem
                title={o.label}
                subtitle={o.description}
                selected={o.value === value}
                onPress={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
              />
            </View>
          ))}
        </ScrollView>
      </Sheet>
    </View>
  );
}
