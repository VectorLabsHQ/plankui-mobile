'use no memo'; // Animated values are mutated outside render; React Compiler memoisation freezes them.
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { ND, useTheme } from '../theme';
import { haptic } from '../haptics';
import { Text } from './Text';

export type SegmentedControlProps = {
  options: string[];
  value: number;
  onChange: (index: number) => void;
  accessibilityLabel?: string;
};

/** Sliding thumb on a grey track. */
export function SegmentedControl({ options, value, onChange, accessibilityLabel }: SegmentedControlProps) {
  const t = useTheme();
  const [w, setW] = useState(0);
  const x = useRef(new Animated.Value(0)).current;
  const seg = w / options.length;

  useEffect(() => {
    Animated.spring(x, { toValue: value * seg, useNativeDriver: ND, speed: 20, bounciness: 4 }).start();
  }, [value, seg, x]);

  const pick = (i: number) => {
    if (i === value) return;
    haptic('select');
    onChange(i);
  };

  

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      onLayout={(e) => setW(e.nativeEvent.layout.width - 4)}
      style={{ flexDirection: 'row', height: 36, padding: 2, borderRadius: t.look.r(9), backgroundColor: t.c.fill, ...(t.look.name === 'brutal' ? { borderWidth: 2, borderColor: t.c.ink, padding: 0 } : null) }}
    >
      {w > 0 && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 2,
            left: 2,
            bottom: 2,
            width: seg,
            ...t.look.thumb,
            borderRadius: t.look.r(7),
            transform: [{ translateX: x }],
          }}
        />
      )}
      {options.map((o, i) => (
        <Pressable
          key={o}
          onPress={() => pick(i)}
          accessibilityRole="tab"
          accessibilityState={{ selected: i === value }}
          hitSlop={{ top: 4, bottom: 4 }}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text variant="footnote" weight={i === value ? '600' : '500'} tone={i === value && t.look.name === 'brutal' ? 'onAccent' : 'ink'} numberOfLines={1}>
            {o}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
