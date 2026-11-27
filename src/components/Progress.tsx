'use no memo'; // Animated values are mutated outside render; React Compiler memoisation freezes them.
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Animated, Easing, View } from 'react-native';
import { ND, useTheme } from '../theme';

/** Turns off looping motion for people who asked for less of it. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => sub.remove();
  }, []);
  return reduced;
}

export type ProgressBarProps = {
  /** 0 to 1. Leave out for an indeterminate bar. */
  value?: number;
  accessibilityLabel?: string;
};

/** Linear progress: a thin track with rounded ends. */
export function ProgressBar({ value, accessibilityLabel = 'Progress' }: ProgressBarProps) {
  const t = useTheme();
  const reduced = useReducedMotion();
  const a = useRef(new Animated.Value(0)).current;
  const indeterminate = value === undefined;
  const brutal = t.look.name === 'brutal';

  useEffect(() => {
    if (!indeterminate || reduced) return;
    const loop = Animated.loop(Animated.timing(a, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: ND }));
    loop.start();
    return () => loop.stop();
  }, [indeterminate, reduced, a]);

  const h = brutal ? 10 : 4;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={indeterminate ? undefined : { min: 0, max: 100, now: Math.round(value! * 100) }}
      style={{ height: h, borderRadius: t.look.r(h / 2), backgroundColor: t.c.fill, overflow: 'hidden', ...(brutal ? { borderWidth: 2, borderColor: t.c.ink } : null) }}
    >
      {indeterminate ? (
        <Animated.View
          style={{
            width: '40%',
            height: '100%',
            borderRadius: t.look.r(h / 2),
            backgroundColor: t.c.accent,
            opacity: reduced ? 0.5 : 1,
            transform: [{ translateX: a.interpolate({ inputRange: [0, 1], outputRange: [-160, 420] }) }],
          }}
        />
      ) : (
        <View style={{ width: `${Math.max(0, Math.min(1, value!)) * 100}%`, height: '100%', borderRadius: t.look.r(h / 2), backgroundColor: t.c.accent }} />
      )}
    </View>
  );
}

/** The platform spinner in the accent colour. */
export function Spinner({ size = 'small', accessibilityLabel = 'Loading' }: { size?: 'small' | 'large'; accessibilityLabel?: string }) {
  const t = useTheme();
  return <ActivityIndicator size={size} color={t.c.muted} accessibilityLabel={accessibilityLabel} />;
}
