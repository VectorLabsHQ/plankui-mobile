import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { shade, useTheme, withAlpha } from '../theme';
import { haptic } from '../haptics';
import { Text } from './Text';

export type ButtonProps = {
  children: string;
  onPress?: () => void;
  /** filled = main action, tinted = second action, outline = third, plain = text only. */
  variant?: 'filled' | 'tinted' | 'outline' | 'plain';
  tone?: 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  /** Stretch to the full width (the usual bottom-of-screen action). */
  block?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Rounded rectangle. Fades when pressed (Android shows its ripple instead).
 * Every size keeps a 44 pt / 48 dp touch target (small ones through hitSlop).
 */
export function Button({
  children,
  onPress,
  variant = 'filled',
  tone = 'accent',
  size = 'md',
  icon,
  loading,
  disabled,
  block,
  accessibilityLabel,
  style,
}: ButtonProps) {
  const t = useTheme();
  const ripple = t.os === 'android'; // ripple instead of a fade
  const base = tone === 'danger' ? t.c.danger : t.c.accent;
  const height = { sm: 32, md: 44, lg: 52 }[size];
  const bg = variant === 'filled' ? base : variant === 'tinted' ? t.wash(base) : 'transparent';
  const fg = variant === 'filled' ? t.c.onAccent : base;
  const off = disabled || loading;
  const slop = Math.max(0, (t.hit - height) / 2);

  return (
    <Pressable
      onPress={() => {
        haptic('tap');
        onPress?.();
      }}
      disabled={off}
      hitSlop={slop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? children}
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      android_ripple={{ color: variant === 'filled' ? 'rgba(255,255,255,0.24)' : t.wash(base), borderless: false }}
      style={({ pressed }) => [
        {
          height,
          paddingHorizontal: variant === 'plain' ? 12 : size === 'sm' ? 14 : 20,
          borderRadius: t.look.r(size === 'lg' ? 14 : size === 'sm' ? 8 : 12),
          backgroundColor: bg,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: variant === 'outline' ? (withAlpha(base, 0.5)) : undefined,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          overflow: 'hidden',
          alignSelf: block ? 'stretch' : 'flex-start',
          opacity: off ? 0.4 : pressed && !ripple && t.look.name !== 'keycap' && t.look.name !== 'brutal' ? 0.7 : 1,
        },
        variant === 'filled' && !off ? t.look.button(base, tone === 'danger' ? shade(base, -0.3) : t.c.accentEdge, pressed) : null,
        variant !== 'filled' && variant !== 'plain' && t.look.name === 'brutal' ? { borderWidth: 2, borderColor: t.c.ink } : null,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : icon ? <View>{icon}</View> : null}
      <Text
        variant={size === 'sm' ? 'subhead' : 'body'}
        weight={'600'}
        style={{ color: fg, letterSpacing: 0 }}
        numberOfLines={1}
      >
        {children}
      </Text>
    </Pressable>
  );
}
