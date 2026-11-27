'use no memo'; // Animated values are mutated outside render; React Compiler memoisation freezes them.
import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Easing, View } from 'react-native';
import { ND, useTheme } from '../theme';
import { useReducedMotion } from './Progress';
import { Text } from './Text';

export type MessageBubbleProps = {
  children: ReactNode;
  /** "me" sits on the right in the accent colour; "them" on the left in grey. */
  from: 'me' | 'them';
  /** Small text under the bubble, such as "9:41" or "Read". */
  meta?: string;
  /** In a run of messages from one person, only the last has the tighter corner and the meta. Default true. */
  last?: boolean;
};

/** A chat message bubble. Put several in a column; consecutive ones from the same person sit 2 pt apart. */
export function MessageBubble({ children, from, meta, last = true }: MessageBubbleProps) {
  const t = useTheme();
  const me = from === 'me';
  const r = t.look.r(18);
  const tight = t.look.r(6);
  return (
    <View style={{ alignItems: me ? 'flex-end' : 'flex-start', marginBottom: last ? 10 : 2 }}>
      <View
        style={{
          maxWidth: '78%',
          paddingHorizontal: 14,
          paddingVertical: 9,
          backgroundColor: me ? t.c.accent : t.c.fill,
          borderTopLeftRadius: r,
          borderTopRightRadius: r,
          borderBottomLeftRadius: !me && last ? tight : r,
          borderBottomRightRadius: me && last ? tight : r,
          ...(t.look.name === 'brutal' ? { borderWidth: 2, borderColor: t.c.ink } : null),
        }}
      >
        {typeof children === 'string' ? <Text style={{ color: me ? t.c.onAccent : t.c.ink }}>{children}</Text> : children}
      </View>
      {meta && last ? <Text variant="caption" tone="muted" style={{ marginTop: 4, marginHorizontal: 6 }}>{meta}</Text> : null}
    </View>
  );
}

/** Three dots in a bubble while the other person (or an assistant) is writing. Still under reduced motion. */
export function TypingIndicator({ accessibilityLabel = 'Typing' }: { accessibilityLabel?: string }) {
  const t = useTheme();
  const reduced = useReducedMotion();
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(Animated.timing(a, { toValue: 1, duration: 1200, easing: Easing.linear, useNativeDriver: ND }));
    loop.start();
    return () => loop.stop();
  }, [reduced, a]);
  return (
    <View accessible accessibilityLabel={accessibilityLabel} accessibilityLiveRegion="polite" style={{ alignItems: 'flex-start', marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', gap: 5, paddingHorizontal: 14, height: 38, alignItems: 'center', borderRadius: t.look.r(18), borderBottomLeftRadius: t.look.r(6), backgroundColor: t.c.fill }}>
        {[0, 1, 2].map((i) => {
          // Each dot rises and brightens in turn.
          const s = i / 3;
          const range = { inputRange: [0, s, s + 0.17, s + 0.34, 1].map((v) => Math.min(1, v)), extrapolate: 'clamp' as const };
          return (
            <Animated.View
              key={i}
              style={{
                width: 7,
                height: 7,
                borderRadius: 3.5,
                backgroundColor: t.c.muted,
                opacity: reduced ? 0.7 : a.interpolate({ ...range, outputRange: [0.4, 0.4, 1, 0.4, 0.4] }),
                transform: reduced ? undefined : [{ translateY: a.interpolate({ ...range, outputRange: [0, 0, -3, 0, 0] }) }],
              }}
            />
          );
        })}
      </View>
    </View>
  );
}
