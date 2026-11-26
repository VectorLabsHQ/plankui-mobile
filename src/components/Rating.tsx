import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { haptic } from '../haptics';
import { Text } from './Text';

export type RatingProps = {
  value: number;
  /** Leave out for a read-only rating (halves are shown rounded to the nearest whole star). */
  onChange?: (value: number) => void;
  max?: number;
  size?: number;
  accessibilityLabel?: string;
};

/** Stars. Tap a star to set it; tap the current star again to clear. Read-only without onChange. */
export function Rating({ value, onChange, max = 5, size = 28, accessibilityLabel = 'Rating' }: RatingProps) {
  const t = useTheme();
  const on = t.c.warning; // same as the web Rating
  const shown = Math.round(value);
  const star = (i: number) => (
    <Text allowFontScaling={false} style={{ fontSize: size, lineHeight: size * 1.15, color: i <= shown ? on : t.c.rule2 }}>
      {i <= shown ? '★' : '☆' /* taste-skill-ignore: U+2605/2606 text stars, the library draws no SVG */}
    </Text>
  );
  if (!onChange) {
    return (
      <View style={{ flexDirection: 'row', gap: 2 }} accessibilityRole="image" accessibilityLabel={`${accessibilityLabel}: ${value} of ${max}`}>
        {Array.from({ length: max }, (_, i) => <View key={i}>{star(i + 1)}</View>)}
      </View>
    );
  }
  return (
    <View
      style={{ flexDirection: 'row' }}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max, now: shown, text: `${shown} of ${max}` }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => onChange(Math.max(0, Math.min(max, shown + (e.nativeEvent.actionName === 'increment' ? 1 : -1))))}
    >
      {Array.from({ length: max }, (_, i) => (
        <Pressable
          key={i}
          onPress={() => {
            haptic('select');
            onChange(i + 1 === shown ? 0 : i + 1);
          }}
          hitSlop={4}
          // 44 pt targets even for small stars
          style={({ pressed }) => ({ minWidth: Math.max(t.hit, size + 4), minHeight: t.hit, alignItems: 'center', justifyContent: 'center', transform: [{ scale: pressed ? 0.88 : 1 }] })}
          importantForAccessibility="no-hide-descendants"
        >
          {star(i + 1)}
        </Pressable>
      ))}
    </View>
  );
}
