import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { haptic } from '../haptics';
import { Glyph, type GlyphName } from './Glyph';

export type IconButtonProps = {
  /** A built-in glyph, or a function that draws your own icon in the colour and size it is given. */
  icon: GlyphName | ((color: string, size: number) => ReactNode);
  /** Required: an icon alone has no name for screen readers. */
  accessibilityLabel: string;
  onPress?: () => void;
  variant?: 'plain' | 'tinted' | 'filled' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
};

/** A round button with only an icon. Small sizes keep a 44 pt touch target through hit slop. */
export function IconButton({ icon, accessibilityLabel, onPress, variant = 'tinted', size = 'md', disabled }: IconButtonProps) {
  const t = useTheme();
  const d = { sm: 32, md: 40, lg: 52 }[size];
  const glyph = { sm: 14, md: 16, lg: 20 }[size];
  const brutal = t.look.name === 'brutal';
  const fg = variant === 'filled' ? t.c.onAccent : variant === 'plain' || variant === 'outline' ? t.c.ink : t.c.accent;
  const bg = variant === 'filled' ? t.c.accent : variant === 'tinted' ? t.wash() : 'transparent';
  const slop = Math.max(0, (t.hit - d) / 2);
  return (
    <Pressable
      onPress={() => {
        haptic('tap');
        onPress?.();
      }}
      disabled={disabled}
      hitSlop={slop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      android_ripple={{ color: variant === 'filled' ? 'rgba(255,255,255,0.24)' : t.wash(t.c.ink), borderless: true, radius: d / 2 + 4 }}
      style={({ pressed }) => ({
        width: d,
        height: d,
        borderRadius: t.look.r(d / 2),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bg,
        borderWidth: variant === 'outline' || (brutal && variant !== 'plain') ? (brutal ? 2 : 1) : 0,
        borderColor: brutal ? t.c.ink : t.c.rule2,
        opacity: disabled ? 0.4 : pressed && t.os !== 'android' ? 0.6 : 1,
        transform: pressed && t.look.name !== 'brutal' ? [{ scale: 0.96 }] : undefined,
      })}
    >
      <View pointerEvents="none">{typeof icon === 'string' ? <Glyph name={icon} color={fg} size={glyph} /> : icon(fg, glyph + 4)}</View>
    </Pressable>
  );
}
