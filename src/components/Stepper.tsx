import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { haptic } from '../haptics';
import { Glyph } from './Glyph';
import { Text } from './Text';

export type StepperProps = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  accessibilityLabel: string;
};

/** Minus / plus for small counts (quantity, guests). iOS: joined pill. Android: two outlined buttons around the value. */
export function Stepper({ value, onChange, min = 0, max = 99, step = 1, accessibilityLabel }: StepperProps) {
  const t = useTheme();
  const android = t.os === 'android';
  const brutal = t.look.name === 'brutal';
  const go = (d: number) => {
    const v = Math.min(max, Math.max(min, value + d));
    if (v !== value) {
      haptic('select');
      onChange(v);
    }
  };
  const btn = (d: number) => {
    const off = d < 0 ? value <= min : value >= max;
    return (
      <Pressable
        onPress={() => go(d)}
        disabled={off}
        accessibilityRole="button"
        accessibilityLabel={`${d < 0 ? 'Decrease' : 'Increase'} ${accessibilityLabel}`}
        android_ripple={{ color: t.wash(t.c.ink), borderless: true }}
        style={({ pressed }) => ({
          width: android ? 40 : 46,
          height: android ? 40 : 32,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: off ? 0.3 : pressed && !android ? 0.5 : 1,
          ...(android ? { borderRadius: t.look.r(20), borderWidth: brutal ? 2 : 1, borderColor: brutal ? t.c.ink : t.c.edge } : null),
        })}
      >
        {d < 0 ? <View style={{ width: 12, height: 2, borderRadius: 1, backgroundColor: t.c.ink }} /> : <Glyph name="plus" color={t.c.ink} size={13} />}
      </Pressable>
    );
  };
  return (
    <View
      accessible={false}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: android ? 12 : 0,
        alignSelf: 'flex-start',
        ...(android ? null : { backgroundColor: t.c.fill, borderRadius: t.look.r(9), ...(brutal ? { borderWidth: 2, borderColor: t.c.ink } : null) }),
      }}
    >
      {btn(-step)}
      {android ? (
        <Text variant="headline" style={{ minWidth: 28, textAlign: 'center' }} accessibilityLiveRegion="polite" accessibilityLabel={`${accessibilityLabel}: ${value}`}>
          {value}
        </Text>
      ) : (
        <View style={{ width: 1, height: 18, backgroundColor: t.c.rule2 }} />
      )}
      {btn(step)}
    </View>
  );
}
