import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { haptic } from '../haptics';
import { Text } from './Text';

const fmtDefault = (n: number) => n.toLocaleString();

export type BarListItem = { label: string; value: number };

export type BarListProps = {
  items: BarListItem[];
  /** Formats the number on the right. Default toLocaleString. */
  format?: (n: number) => string;
};

/** Ranked rows with a bar behind each label: top pages, sources, countries. Longest bar is the biggest value. */
export function BarList({ items, format = fmtDefault }: BarListProps) {
  const t = useTheme();
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <View accessibilityRole="list" style={{ gap: 6 }}>
      {items.map((it) => (
        <View key={it.label} accessible accessibilityLabel={`${it.label}, ${format(it.value)}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1, height: 36, justifyContent: 'center' }}>
            <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(it.value / max) * 100}%`, borderRadius: t.look.r(8), backgroundColor: t.wash() }} />
            <Text variant="subhead" numberOfLines={1} style={{ paddingHorizontal: 10 }}>{it.label}</Text>
          </View>
          <Text variant="subhead" weight="500" style={{ minWidth: 44, textAlign: 'right', fontVariant: ['tabular-nums'] }}>{format(it.value)}</Text>
        </View>
      ))}
    </View>
  );
}

export type BarChartDatum = { label: string; value: number };

export type BarChartProps = {
  data: BarChartDatum[];
  /** Chart height in points, bars only. Default 160. */
  height?: number;
  format?: (n: number) => string;
  /** The bar picked at first. Default the last one. */
  defaultSelected?: number;
  accessibilityLabel?: string;
};

/** Vertical bars for a few periods (days, months). Tap a bar to read its value. */
export function BarChart({ data, height = 160, format = fmtDefault, defaultSelected, accessibilityLabel = 'Bar chart' }: BarChartProps) {
  const t = useTheme();
  const [sel, setSel] = useState(defaultSelected ?? data.length - 1);
  const max = Math.max(1, ...data.map((d) => d.value));
  const picked = data[sel];
  return (
    <View accessibilityLabel={accessibilityLabel} style={{ gap: 10 }}>
      {picked ? (
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }} accessibilityLiveRegion="polite">
          <Text variant="title2" weight="600" style={{ fontVariant: ['tabular-nums'] }}>{format(picked.value)}</Text>
          <Text variant="subhead" tone="muted">{picked.label}</Text>
        </View>
      ) : null}
      <View style={{ height, flexDirection: 'row', alignItems: 'flex-end', gap: 6, borderBottomWidth: 1, borderColor: t.c.rule }}>
        {data.map((d, i) => {
          const on = i === sel;
          return (
            <Pressable
              key={`${d.label}-${i}`}
              onPress={() => {
                haptic('select');
                setSel(i);
              }}
              accessibilityRole="button"
              accessibilityLabel={`${d.label}, ${format(d.value)}`}
              accessibilityState={{ selected: on }}
              style={{ flex: 1, height: '100%', justifyContent: 'flex-end' }}
            >
              <View
                style={{
                  height: `${Math.max(2, (d.value / max) * 100)}%`,
                  borderTopLeftRadius: t.look.r(6),
                  borderTopRightRadius: t.look.r(6),
                  backgroundColor: on ? t.c.accent : t.wash(),
                  ...(t.look.name === 'brutal' ? { borderWidth: 2, borderBottomWidth: 0, borderColor: t.c.ink } : null),
                }}
              />
            </Pressable>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', gap: 6 }} importantForAccessibility="no-hide-descendants">
        {data.map((d, i) => (
          <Text key={`${d.label}-${i}`} variant="caption" numberOfLines={1} style={{ flex: 1, textAlign: 'center', color: i === sel ? t.c.ink : t.c.muted }}>{d.label}</Text>
        ))}
      </View>
    </View>
  );
}

export type SparklineProps = {
  data: number[];
  /** Default 40. */
  height?: number;
  /** Line colour. Default the accent; trend picks green or red. */
  color?: string;
  /** Colour by direction: green if the last value is above the first, red if below. */
  trend?: boolean;
  /** Line thickness. Default 2. */
  thickness?: number;
  accessibilityLabel?: string;
};

/** A tiny line chart with no axes, for a trend beside a number. Fills the width it is given. */
export function Sparkline({ data, height = 40, color, trend, thickness = 2, accessibilityLabel }: SparklineProps) {
  const t = useTheme();
  const [width, setWidth] = useState(0);
  const lo = Math.min(...data);
  const hi = Math.max(...data);
  const range = hi - lo || 1;
  const up = data.length > 1 && data[data.length - 1] >= data[0];
  const c = color ?? (trend ? (up ? t.c.success : t.c.danger) : t.c.accent);
  const pad = thickness;
  const pts = data.map((v, i) => ({
    x: data.length > 1 ? (i / (data.length - 1)) * width : width / 2,
    y: pad + (1 - (v - lo) / range) * (height - pad * 2),
  }));
  const last = pts[pts.length - 1];
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? (data.length > 1 ? `Trend ${up ? 'up' : 'down'}, from ${data[0]} to ${data[data.length - 1]}` : 'Trend')}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ height, width: '100%' }}
    >
      {width > 0
        ? pts.slice(1).map((p, i) => {
            const a = pts[i];
            const dx = p.x - a.x;
            const dy = p.y - a.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            // One rotated bar per segment, centred on the segment's midpoint; round ends hide the joins.
            return (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  left: (a.x + p.x) / 2 - len / 2 - thickness / 2,
                  top: (a.y + p.y) / 2 - thickness / 2,
                  width: len + thickness,
                  height: thickness,
                  borderRadius: thickness / 2,
                  backgroundColor: c,
                  transform: [{ rotate: `${Math.atan2(dy, dx)}rad` }],
                }}
              />
            );
          })
        : null}
      {width > 0 && last ? (
        <View style={{ position: 'absolute', left: last.x - thickness * 2, top: last.y - thickness * 2, width: thickness * 4, height: thickness * 4, borderRadius: thickness * 2, backgroundColor: c }} />
      ) : null}
    </View>
  );
}
