import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export type BadgeProps = { children: string; tone?: 'accent' | 'success' | 'warning' | 'danger' | 'neutral' };

/** Small status pill. */
export function Badge({ children, tone = 'accent' }: BadgeProps) {
  const t = useTheme();
  const color = tone === 'neutral' ? t.c.ink2 : t.c[tone];
  return (
    <View style={{ alignSelf: 'flex-start', paddingHorizontal: 8, height: 22, justifyContent: 'center', backgroundColor: t.wash(tone === 'neutral' ? '#808080' : color), borderRadius: t.look.r(11), ...(t.look.name === 'brutal' ? { borderWidth: 2, borderColor: t.c.ink } : null) }}>
      <Text variant="caption" weight="600" style={{ color }} numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
}
