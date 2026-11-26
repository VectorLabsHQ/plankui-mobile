import { View } from 'react-native';
import { useTheme } from '../theme';
import { Glyph } from './Glyph';
import { Text } from './Text';

export type TimelineItem = {
  title: string;
  detail?: string;
  time?: string;
  /** done: filled with a check; current: accent ring; next: hollow. Default done. */
  state?: 'done' | 'current' | 'next';
};

/** Steps or events down a line: order tracking, a history, an onboarding path. */
export function Timeline({ items }: { items: TimelineItem[] }) {
  const t = useTheme();
  return (
    <View accessibilityRole="list">
      {items.map((it, i) => {
        const state = it.state ?? 'done';
        const last = i === items.length - 1;
        const nextDone = (items[i + 1]?.state ?? 'done') !== 'next';
        return (
          <View key={i} style={{ flexDirection: 'row', gap: 12 }} accessible accessibilityLabel={[it.title, it.detail, it.time, state === 'current' ? 'in progress' : state === 'next' ? 'to come' : 'done'].filter(Boolean).join(', ')}>
            <View style={{ alignItems: 'center', width: 28 }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: state === 'done' ? t.c.accent : t.c.surface,
                  borderWidth: state === 'done' ? 0 : state === 'current' ? 2 : 1,
                  borderColor: state === 'current' ? t.c.accent : t.c.rule2,
                }}
              >
                {state === 'done' ? <Glyph name="check" color={t.c.onAccent} size={12} /> : <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: state === 'current' ? t.c.accent : t.c.muted }} />}
              </View>
              {last ? null : <View style={{ flex: 1, width: 1, backgroundColor: nextDone ? t.c.accent : t.c.rule }} />}
            </View>
            <View style={{ flex: 1, paddingTop: 3, paddingBottom: last ? 0 : 24, gap: 2 }}>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'baseline' }}>
                <Text variant="callout" weight="500" style={{ flex: 1, color: state === 'next' ? t.c.muted : t.c.ink }}>{it.title}</Text>
                {it.time ? <Text variant="footnote" tone="muted">{it.time}</Text> : null}
              </View>
              {it.detail ? <Text variant="subhead" tone="muted">{it.detail}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
