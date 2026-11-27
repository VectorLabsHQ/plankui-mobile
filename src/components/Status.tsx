'use no memo'; // Animated values are mutated outside render; React Compiler memoisation freezes them.
import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { ND, useTheme } from '../theme';
import { useReducedMotion } from './Progress';
import { Text } from './Text';

export type StatusDotProps = {
  status: 'online' | 'away' | 'busy' | 'offline';
  /** Text beside the dot. Leave out for the dot alone (it still has a spoken name). */
  label?: string;
  /** A soft ring that pulses out of the dot, for live states. Off under reduced motion. */
  pulse?: boolean;
};

const WORDS = { online: 'Online', away: 'Away', busy: 'Busy', offline: 'Offline' } as const;

/** A coloured dot for presence or service status: online, away, busy, offline. */
export function StatusDot({ status, label, pulse }: StatusDotProps) {
  const t = useTheme();
  const reduced = useReducedMotion();
  const a = useRef(new Animated.Value(0)).current;
  const color = { online: t.c.success, away: t.c.warning, busy: t.c.danger, offline: t.c.muted }[status];
  const live = !!pulse && !reduced && status !== 'offline';
  useEffect(() => {
    if (!live) return;
    const loop = Animated.loop(Animated.timing(a, { toValue: 1, duration: 1600, easing: Easing.out(Easing.ease), useNativeDriver: ND }));
    loop.start();
    return () => loop.stop();
  }, [live, a]);
  return (
    <View accessible accessibilityLabel={label ? `${label}, ${WORDS[status]}` : WORDS[status]} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View style={{ width: 10, height: 10, alignItems: 'center', justifyContent: 'center' }}>
        {live ? (
          <Animated.View
            style={{
              position: 'absolute',
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: color,
              opacity: a.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
              transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] }) }],
            }}
          />
        ) : null}
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: status === 'offline' ? 'transparent' : color,
            borderWidth: status === 'offline' ? 2 : 0,
            borderColor: color,
          }}
        />
      </View>
      {label ? <Text variant="subhead" tone="ink2">{label}</Text> : null}
    </View>
  );
}
