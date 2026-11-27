import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { haptic } from '../haptics';
import { Glyph } from './Glyph';
import { Text } from './Text';

export type CalendarProps = {
  /** The chosen day. */
  value?: Date | null;
  onChange?: (date: Date) => void;
  /** Days before this can't be picked. */
  min?: Date;
  /** Days after this can't be picked. */
  max?: Date;
  /** 0 Sunday, 1 Monday. Default 1. */
  weekStartsOn?: 0 | 1;
  /** Language for month and day names. Default the device's. */
  locale?: string;
};

const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const same = (a?: Date | null, b?: Date | null) => !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** The weeks of a month (Monday or Sunday first), with leading and trailing days from the next and last months. */
export function monthGrid(year: number, month: number, weekStartsOn: 0 | 1 = 1): Date[] {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() - weekStartsOn + 7) % 7;
  const start = new Date(year, month, 1 - lead);
  const days = new Date(year, month + 1, 0).getDate();
  const weeks = Math.ceil((lead + days) / 7);
  return Array.from({ length: weeks * 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

/** A month to pick one day from, with today ringed and arrows to the next and last months. */
export function Calendar({ value, onChange, min, max, weekStartsOn = 1, locale }: CalendarProps) {
  const t = useTheme();
  const today = day(new Date());
  const [view, setView] = useState(() => {
    const d = value ?? today;
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const cells = useMemo(() => monthGrid(view.y, view.m, weekStartsOn), [view, weekStartsOn]);
  const title = new Date(view.y, view.m, 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  const names = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2024, 0, 7 + weekStartsOn + i); // 7 Jan 2024 is a Sunday
    return { short: d.toLocaleDateString(locale, { weekday: 'narrow' }), long: d.toLocaleDateString(locale, { weekday: 'long' }) };
  });
  const lo = min ? day(min) : null;
  const hi = max ? day(max) : null;
  const canPrev = !lo || new Date(view.y, view.m, 1) > lo;
  const canNext = !hi || new Date(view.y, view.m + 1, 0) < hi;
  const move = (n: number) => {
    haptic('select');
    setView((v) => {
      const d = new Date(v.y, v.m + n, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };
  const arrow = (dir: -1 | 1, on: boolean) => (
    <Pressable
      onPress={() => move(dir)}
      disabled={!on}
      accessibilityRole="button"
      accessibilityLabel={dir < 0 ? 'Previous month' : 'Next month'}
      android_ripple={{ color: t.wash(t.c.ink), borderless: true, radius: 22 }}
      style={({ pressed }) => ({ width: t.hit, height: t.hit, alignItems: 'center', justifyContent: 'center', opacity: !on ? 0.3 : pressed && t.os !== 'android' ? 0.5 : 1 })}
    >
      <Glyph name={dir < 0 ? 'chevron-left' : 'chevron-right'} color={t.c.accent} size={16} />
    </Pressable>
  );
  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text variant="headline" style={{ flex: 1, paddingLeft: 4 }} accessibilityRole="header" accessibilityLiveRegion="polite">{title}</Text>
        {arrow(-1, canPrev)}
        {arrow(1, canNext)}
      </View>
      <View style={{ flexDirection: 'row' }} importantForAccessibility="no-hide-descendants">
        {names.map((n, i) => (
          <Text key={i} variant="caption" tone="muted" weight="600" center style={{ flex: 1 }} accessibilityLabel={n.long}>{n.short}</Text>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((d) => {
          const inMonth = d.getMonth() === view.m;
          const off = (lo && d < lo) || (hi && d > hi);
          const sel = same(d, value);
          const isToday = same(d, today);
          return (
            <View key={d.toISOString()} style={{ width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 2 }}>
              <Pressable
                onPress={() => {
                  haptic('select');
                  if (!inMonth) setView({ y: d.getFullYear(), m: d.getMonth() });
                  onChange?.(d);
                }}
                disabled={!!off}
                accessibilityRole="button"
                accessibilityLabel={d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' }) + (isToday ? ', today' : '')}
                accessibilityState={{ selected: sel, disabled: !!off }}
                style={({ pressed }) => ({
                  width: 40,
                  height: 40,
                  borderRadius: t.look.r(20),
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: sel ? t.c.accent : pressed ? t.c.fill : 'transparent',
                  borderWidth: isToday && !sel ? 1.5 : 0,
                  borderColor: t.c.accent,
                })}
              >
                <Text
                  variant="callout"
                  weight={sel || isToday ? '600' : '400'}
                  style={{ color: sel ? t.c.onAccent : off ? t.c.rule2 : !inMonth ? t.c.muted : isToday ? t.c.accent : t.c.ink, fontVariant: ['tabular-nums'], opacity: off ? 0.6 : 1 }}
                >
                  {d.getDate()}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}
