import { Text as RNText, type TextProps } from 'react-native';
import { useTheme, type TypeVariant } from '../theme';

export type PlankTextProps = TextProps & {
  variant?: TypeVariant;
  tone?: 'ink' | 'ink2' | 'muted' | 'accent' | 'danger' | 'onAccent';
  weight?: '400' | '500' | '600' | '700';
  center?: boolean;
};

/** Text on the platform's type scale. Font scaling stays on (accessibility). */
const DISPLAY = new Set<TypeVariant>(['largeTitle', 'title', 'title2']);

export function Text({ variant = 'body', tone = 'ink', weight, center, style, ...rest }: PlankTextProps) {
  const t = useTheme();
  return (
    <RNText
      {...rest}
      style={[
        t.type[variant],
        { color: t.c[tone] },
        (t.font.display && DISPLAY.has(variant) ? { fontFamily: t.font.display } : t.font.body ? { fontFamily: t.font.body } : null),
        DISPLAY.has(variant) && { letterSpacing: (t.type[variant].fontSize ?? 17) * -0.015 },
        weight && { fontWeight: weight },
        center && { textAlign: 'center' },
        style,
      ]}
    />
  );
}
