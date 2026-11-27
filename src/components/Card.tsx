import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { haptic } from '../haptics';

export type CardProps = {
  children: ReactNode;
  /** Makes the whole card one button. */
  onPress?: () => void;
  accessibilityLabel?: string;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** A surface in the current look: soft shadow, flat outline, glass, keycap edge or brutal block. */
export function Card({ children, onPress, accessibilityLabel, padded = true, style }: CardProps) {
  const t = useTheme();
  const base = [t.look.card, { borderRadius: t.look.r(14), padding: padded ? 16 : 0, gap: 8 }, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable
      onPress={() => {
        haptic('tap');
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      android_ripple={{ color: t.wash(t.c.ink) }}
      style={({ pressed }) => [base, pressed && (t.look.name === 'brutal' ? { transform: [{ translateX: 2 }, { translateY: 2 }], boxShadow: `2px 2px 0 0 ${t.c.ink}` } : { opacity: 0.85 })]}
    >
      {children}
    </Pressable>
  );
}
