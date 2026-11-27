'use no memo'; // Animated values are mutated outside render; React Compiler memoisation freezes them.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, View, type TextStyle } from 'react-native';
import { useTheme } from '../theme';
import { useReducedMotion } from './Progress';
import { Text } from './Text';
import type { TypeVariant } from '../theme';

export type ProgressCircleProps = {
  /** 0 to 1. */
  value: number;
  size?: number;
  /** Ring thickness. Default size / 10. */
  thickness?: number;
  /** Ring colour. Default the accent. */
  color?: string;
  /** Drawn in the middle, e.g. "72%" or an icon. Default the percentage. */
  children?: ReactNode;
  accessibilityLabel?: string;
};

/**
 * A ring that fills clockwise from the top: goals, storage, a timer.
 * Drawn with two clipped half rings, so it needs no SVG library.
 */
export function ProgressCircle({ value, size = 96, thickness, color, children, accessibilityLabel = 'Progress' }: ProgressCircleProps) {
  const t = useTheme();
  const p = Math.max(0, Math.min(1, value));
  const w = thickness ?? Math.max(3, Math.round(size / 10));
  const c = color ?? t.c.accent;
  const half = size / 2;
  // A half ring: the left (side 'left') or right half of a circle outline.
  const ring = (side: 'left' | 'right') => ({
    position: 'absolute' as const,
    top: 0,
    [side]: 0,
    width: half,
    height: size,
    borderWidth: w,
    borderColor: c,
    ...(side === 'left'
      ? { borderRightWidth: 0, borderTopLeftRadius: half, borderBottomLeftRadius: half }
      : { borderLeftWidth: 0, borderTopRightRadius: half, borderBottomRightRadius: half }),
  });
  const first = Math.min(p, 0.5) * 360; // sweep shown in the right half
  const second = Math.max(0, p - 0.5) * 360; // sweep shown in the left half
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(p * 100) }}
      style={{ width: size, height: size }}
    >
      <View style={{ position: 'absolute', width: size, height: size, borderRadius: half, borderWidth: w, borderColor: t.c.fill }} />
      {/* Right half: a left half ring turned clockwise into view. */}
      <View style={{ position: 'absolute', left: half, width: half, height: size, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', left: -half, width: size, height: size, transform: [{ rotate: `${first}deg` }] }}>
          {p > 0 ? <View style={ring('left')} /> : null}
        </View>
      </View>
      {/* Left half: a right half ring turned on past six o'clock. */}
      <View style={{ position: 'absolute', left: 0, width: half, height: size, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', left: 0, width: size, height: size, transform: [{ rotate: `${second}deg` }] }}>
          {p > 0.5 ? <View style={ring('right')} /> : null}
        </View>
      </View>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        {children ?? (
          <Text variant={size >= 88 ? 'title2' : 'subhead'} weight="600" style={{ fontVariant: ['tabular-nums'] }}>{`${Math.round(p * 100)}%`}</Text>
        )}
      </View>
    </View>
  );
}

export type CountUpProps = {
  /** The number to land on. */
  value: number;
  /** Where to start. Default 0. */
  from?: number;
  /** Decimal places. Default 0. */
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Milliseconds. Default 1200. */
  duration?: number;
  variant?: TypeVariant;
  style?: TextStyle;
};

/** A number that counts up to its value when it appears or changes. Lands at once under reduced motion. */
export function CountUp({ value, from = 0, decimals = 0, prefix = '', suffix = '', duration = 1200, variant = 'title', style }: CountUpProps) {
  const reduced = useReducedMotion();
  const a = useRef(new Animated.Value(from)).current;
  const [shown, setShown] = useState(reduced ? value : from);
  useEffect(() => {
    if (reduced) {
      a.setValue(value);
      setShown(value);
      return;
    }
    const id = a.addListener(({ value: v }) => setShown(v));
    const anim = Animated.timing(a, { toValue: value, duration, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    anim.start();
    return () => {
      anim.stop();
      a.removeListener(id);
    };
  }, [value, duration, reduced, a]);
  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <Text variant={variant} weight="600" accessibilityLabel={`${prefix}${fmt(value)}${suffix}`} style={[{ fontVariant: ['tabular-nums'] }, style]}>
      {`${prefix}${fmt(shown)}${suffix}`}
    </Text>
  );
}

export type MeterProps = {
  label: string;
  value: number;
  /** Default 100. */
  max?: number;
  /** Shown on the right, e.g. "42 of 50 GB". Default "value / max". */
  valueLabel?: string;
  /** Share of max (0 to 1) where the bar turns amber. */
  warnAt?: number;
  /** Share of max (0 to 1) where the bar turns red. */
  dangerAt?: number;
  caption?: string;
};

/** A labelled measure of a known amount: storage, a plan's usage, a budget. Turns amber, then red, past the limits you set. */
export function Meter({ label, value, max = 100, valueLabel, warnAt, dangerAt, caption }: MeterProps) {
  const t = useTheme();
  const share = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  const color = dangerAt !== undefined && share >= dangerAt ? t.c.danger : warnAt !== undefined && share >= warnAt ? t.c.warning : t.c.accent;
  const brutal = t.look.name === 'brutal';
  const h = brutal ? 12 : 8;
  const right = valueLabel ?? `${value.toLocaleString()} / ${max.toLocaleString()}`;
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={[label, right, caption].filter(Boolean).join(', ')}
      accessibilityValue={{ min: 0, max, now: value }}
      style={{ gap: 8 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 12 }}>
        <Text variant="subhead" weight="500" style={{ flex: 1 }} numberOfLines={1}>{label}</Text>
        <Text variant="subhead" tone="muted" style={{ fontVariant: ['tabular-nums'] }}>{right}</Text>
      </View>
      <View style={{ height: h, borderRadius: t.look.r(h / 2), backgroundColor: t.c.fill, overflow: 'hidden', ...(brutal ? { borderWidth: 2, borderColor: t.c.ink } : null) }}>
        <View style={{ width: `${share * 100}%`, height: '100%', borderRadius: t.look.r(h / 2), backgroundColor: color }} />
      </View>
      {caption ? <Text variant="footnote" tone="muted">{caption}</Text> : null}
    </View>
  );
}
