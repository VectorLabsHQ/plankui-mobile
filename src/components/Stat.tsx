import { View } from 'react-native';
import { useTheme } from '../theme';
import { Card } from './Card';
import { Text } from './Text';

export type StatProps = {
  label: string;
  value: string;
  /** Change against the last period, e.g. "+12%". Its sign picks the colour unless tone is set. */
  change?: string;
  tone?: 'success' | 'danger' | 'muted';
  caption?: string;
};

/** One number on a card with its label and change. Put two in a row with flex: 1. */
export function Stat({ label, value, change, tone, caption }: StatProps) {
  const t = useTheme();
  const tn = tone ?? (change?.trim().startsWith('-') || change?.trim().startsWith('−') ? 'danger' : 'success');
  const color = tn === 'muted' ? t.c.muted : t.c[tn];
  return (
    <Card>
      <View accessible accessibilityLabel={[label, value, change, caption].filter(Boolean).join(', ')} style={{ gap: 4 }}>
        <Text variant="subhead" tone="muted" numberOfLines={1}>{label}</Text>
        <Text variant="title" weight="600" numberOfLines={1} adjustsFontSizeToFit style={{ fontVariant: ['tabular-nums'] }}>{value}</Text>
        {change || caption ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 6, alignItems: 'center' }}>
            {change ? <Text variant="subhead" weight="500" style={{ color, fontVariant: ['tabular-nums'] }}>{`${tn === 'danger' ? '↓' : tn === 'success' ? '↑' : ''} ${change}`.trim()}</Text> : null}
            {caption ? <Text variant="subhead" tone="muted">{caption}</Text> : null}
          </View>
        ) : null}
      </View>
    </Card>
  );
}
