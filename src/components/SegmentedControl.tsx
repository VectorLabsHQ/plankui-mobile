import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { ND, useTheme } from '../theme';
import { haptic } from '../haptics';
import { Glyph } from './Glyph';
import { Text } from './Text';

export type SegmentedControlProps = {
  options: string[];
  value: number;
  onChange: (index: number) => void;
  accessibilityLabel?: string;
};

/** iOS: sliding thumb on a grey track. Android: Material 3 segmented buttons with a check. */
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

  if (t.os === 'android') {
    return (
      <View accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel} style={{ flexDirection: 'row', height: 48, paddingVertical: 4 }}>
        {options.map((o, i) => {
          const on = i === value;
          return (
            <Pressable
              key={o}
              onPress={() => pick(i)}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              android_ripple={{ color: t.wash() }}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                borderWidth: 1,
                borderColor: t.c.muted,
                marginLeft: i ? -1 : 0,
                backgroundColor: on ? t.wash() : 'transparent',
                borderTopLeftRadius: i === 0 ? 20 : 0,
                borderBottomLeftRadius: i === 0 ? 20 : 0,
                borderTopRightRadius: i === options.length - 1 ? 20 : 0,
                borderBottomRightRadius: i === options.length - 1 ? 20 : 0,
                overflow: 'hidden',
              }}
            >
              {on ? <Glyph name="check" color={t.c.ink} size={14} /> : null}
              <Text variant="subhead" weight="500" numberOfLines={1}>
                {o}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

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
